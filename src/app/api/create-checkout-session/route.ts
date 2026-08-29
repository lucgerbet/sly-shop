import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { PRICES, DEPOSIT_CENTS, getDisplayPriceCents } from "@/lib/pricing";
import { isRateLimited } from "@/lib/rate-limit";

const bodySchema = z.object({
  type: z.string(),
  customer: z.object({
    firstName: z.string().max(200).optional(),
    lastName: z.string().max(200).optional(),
    email: z.string().email().optional(),
    referredBy: z.string().max(200).optional(),
  }).optional(),
  // `config`/`configSummary` are opaque to this route — just forwarded to
  // the CRM intake below — so only their shape is checked, not every field.
  config: z.record(z.string(), z.unknown()).optional(),
  configSummary: z.array(z.tuple([z.string(), z.string()])).optional(),
});

const CANONICAL_ORIGIN = "https://www.sly-atelier.com";
// Same-origin/known-domain check for the Stripe success/cancel redirect —
// without this, a request forged outside the browser UI (arbitrary Origin
// header) could point a real Stripe Checkout session at an attacker domain.
const ALLOWED_ORIGINS = new Set([CANONICAL_ORIGIN, "https://sly-atelier.com"]);

function resolveOrigin(req: NextRequest): string {
  const origin = req.headers.get("origin");
  if (!origin) return CANONICAL_ORIGIN;
  if (ALLOWED_ORIGINS.has(origin)) return origin;
  if (process.env.NODE_ENV !== "production" && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return origin;
  return CANONICAL_ORIGIN;
}

export async function POST(req: NextRequest) {
  if (isRateLimited(req, { limit: 10, windowMs: 5 * 60_000 })) {
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans quelques minutes" }, { status: 429 });
  }

  const rawBody = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }
  const { type, customer, config, configSummary } = parsed.data;
  const item = PRICES[type];
  if (!item) {
    return NextResponse.json({ error: "Type de pièce invalide" }, { status: 400 });
  }
  const isFullPayment = item.paymentMode === "full";
  const promoCode = String(config?.promoCode ?? "");
  // For a full-payment item (e.g. the shirt), there's no separate deposit —
  // the whole displayed price (promo code included) is charged right now.
  const chargeCents = isFullPayment ? getDisplayPriceCents(type, promoCode) : DEPOSIT_CENTS;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-06-24.dahlia" });
  const origin = resolveOrigin(req);

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: isFullPayment ? item.label : `Acompte — ${item.label}`,
              description: isFullPayment
                ? "Paiement complet SLY Atelier. Le rendez-vous vidéo de prise de mesures se réserve juste après."
                : "Acompte de réservation SLY Atelier, déduit du prix total. 75 € non remboursables si la commande n'est pas finalisée.",
            },
            unit_amount: chargeCents,
          },
          quantity: 1,
        },
      ],
      // sly-crm's webhook branches on `kind` — "full_payment" marks the order
      // as fully settled immediately (no balance ever invoiced), "deposit"
      // keeps the existing deposit-now/balance-after-fitting flow.
      metadata: { kind: isFullPayment ? "full_payment" : "deposit", piece: type },
      // The workshop ships the finished piece straight to the client, so the
      // delivery address is collected right here, at the moment of paying
      // the deposit — Stripe's own hosted field, not a custom form to build
      // and validate. Picked up from the webhook (checkout.session.completed)
      // once the customer actually submits it, and written to the CRM's
      // clients.address (see sly-crm/backend/routes/webhooks.js).
      shipping_address_collection: {
        allowed_countries: ["FR", "BE", "CH", "LU", "MC", "DE", "GB", "US", "CA"],
      },
      success_url: `${origin}/customize/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/customize?payment=cancelled`,
    });
  } catch (err) {
    console.error("[create-checkout-session] Stripe session creation failed", err);
    return NextResponse.json({ error: "Impossible de créer la session de paiement" }, { status: 502 });
  }

  // Stage the order in the CRM now, while the full config is still available
  // server-side — Stripe's own metadata can't hold it (500-char/50-key
  // limits). Awaited with a short timeout rather than fire-and-forget: on
  // Vercel's serverless runtime, un-awaited promises can be cut off the
  // moment the response is returned, so a truly "fire and forget" call here
  // could silently never complete. A 3s cap keeps this from meaningfully
  // slowing down checkout while still giving the call a real chance to land;
  // any failure or timeout is logged and swallowed — a customer must always
  // be able to pay even if the CRM is briefly unreachable. The Stripe
  // webhook still fires checkout.session.completed regardless, so a missed
  // intake call only degrades to a manual reconciliation case, not a lost
  // payment.
  const crmUrl = process.env.SLY_CRM_URL;
  const intakeSecret = process.env.SLY_INTAKE_SECRET;
  if (crmUrl && intakeSecret && customer?.email) {
    try {
      await fetch(`${crmUrl}/api/orders/intake`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${intakeSecret}` },
        body: JSON.stringify({
          stripeCheckoutSessionId: session.id,
          productType: type,
          // The amount actually charged just now — the deposit for the
          // classic flow, or the full price for a full-payment item like the shirt.
          depositAmountCents: chargeCents,
          isFullPayment,
          // The price the client was actually shown (promo code applied), as
          // a number rather than only as a line of French text buried in
          // configSummary — so the CRM can show an expected total for an
          // order that hasn't had its fitting call yet. It stays a quote:
          // the binding total is the one Luc confirms at /finalize.
          quotedTotalCents: getDisplayPriceCents(type, promoCode),
          customer,
          config,
          configSummary,
        }),
        signal: AbortSignal.timeout(3000),
      });
    } catch (err) {
      console.error("[create-checkout-session] CRM intake failed", err);
    }
  }

  return NextResponse.json({ url: session.url });
}
