import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { PRICES, DEPOSIT_CENTS } from "@/lib/pricing";
import { isRateLimited } from "@/lib/rate-limit";

const BESPOKE_TYPES = ["suit", "blazer", "trousers", "shirt"] as const;

const bodySchema = z.object({
  type: z.enum(BESPOKE_TYPES),
  customer: z.object({
    firstName: z.string().max(200),
    lastName: z.string().max(200),
    email: z.string().email(),
  }),
  notes: z.string().max(2000).optional(),
  // Public Vercel Blob URLs, already uploaded client-side before this call —
  // see /api/bespoke-upload. Capped at 5: this is a reference for Luc to
  // work from on the call, not a moodboard.
  photoUrls: z.array(z.string().url()).min(1).max(5),
});

const CANONICAL_ORIGIN = "https://www.sly-atelier.com";
const ALLOWED_ORIGINS = new Set([CANONICAL_ORIGIN, "https://sly-atelier.com"]);

function resolveOrigin(req: NextRequest): string {
  const origin = req.headers.get("origin");
  if (!origin) return CANONICAL_ORIGIN;
  if (ALLOWED_ORIGINS.has(origin)) return origin;
  if (process.env.NODE_ENV !== "production" && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return origin;
  return CANONICAL_ORIGIN;
}

// "Bespoke" reproduction charges exactly what the same piece costs through
// the classic configurator (deposit for suit/blazer/trousers, full payment
// for the shirt) — same PRICES table, same payment mechanics, same Stripe
// webhook branch in sly-crm (kind: "deposit" | "full_payment", unchanged).
// The only thing that's different is what's in configSummary: not 15 style
// choices, but the reference photos and the client's own description — the
// actual style gets worked out live with Luc on the call, photo in hand.
export async function POST(req: NextRequest) {
  if (isRateLimited(req, { limit: 10, windowMs: 5 * 60_000 })) {
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans quelques minutes" }, { status: 429 });
  }

  const rawBody = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }
  const { type, customer, notes, photoUrls } = parsed.data;
  const item = PRICES[type];
  const isFullPayment = item.paymentMode === "full";
  const chargeCents = isFullPayment ? item.amountCents : DEPOSIT_CENTS;

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
              name: isFullPayment ? `Bespoke — ${item.label}` : `Acompte — Bespoke ${item.label}`,
              description: isFullPayment
                ? "Reproduction sur mesure SLY Atelier, paiement complet. Le rendez-vous vidéo se réserve juste après."
                : "Acompte de réservation pour une reproduction sur mesure SLY Atelier, déduit du prix total. 75 € non remboursables si la commande n'est pas finalisée.",
            },
            unit_amount: chargeCents,
          },
          quantity: 1,
        },
      ],
      metadata: { kind: isFullPayment ? "full_payment" : "deposit", piece: type, bespoke: "1" },
      shipping_address_collection: {
        allowed_countries: ["FR", "BE", "CH", "LU", "MC", "DE", "GB", "US", "CA"],
      },
      success_url: `${origin}/bespoke/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/bespoke?payment=cancelled`,
    });
  } catch (err) {
    console.error("[create-bespoke-checkout-session] Stripe session creation failed", err);
    return NextResponse.json({ error: "Impossible de créer la session de paiement" }, { status: 502 });
  }

  const crmUrl = process.env.SLY_CRM_URL;
  const intakeSecret = process.env.SLY_INTAKE_SECRET;
  if (crmUrl && intakeSecret) {
    const configSummary: [string, string][] = [
      ["Type de commande", "🎨 Reproduction bespoke"],
      ["Pièce", item.label],
      ...photoUrls.map((url, i): [string, string] => [
        photoUrls.length > 1 ? `Photo de référence ${i + 1}` : "Photo de référence",
        url,
      ]),
      ["Description du client", notes?.trim() || "—"],
    ];
    try {
      await fetch(`${crmUrl}/api/orders/intake`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${intakeSecret}` },
        body: JSON.stringify({
          stripeCheckoutSessionId: session.id,
          productType: type,
          depositAmountCents: chargeCents,
          isFullPayment,
          quotedTotalCents: item.amountCents,
          customer,
          // Kept minimal on purpose — this isn't a Config from the classic
          // configurator, just enough for the success page's Calendly
          // prefill (firstName/lastName/email) and for the CRM to have the
          // raw payload on file alongside configSummary.
          config: { firstName: customer.firstName, lastName: customer.lastName, email: customer.email, type, notes: notes || "", photoUrls },
          configSummary,
        }),
        signal: AbortSignal.timeout(3000),
      });
    } catch (err) {
      console.error("[create-bespoke-checkout-session] CRM intake failed", err);
    }
  }

  return NextResponse.json({ url: session.url });
}
