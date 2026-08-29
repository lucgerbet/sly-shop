import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { GIFT_PACKS } from "@/lib/pricing";
import { isRateLimited } from "@/lib/rate-limit";

const bodySchema = z.object({
  packKey: z.string(),
  buyer: z.object({
    firstName: z.string().max(200).optional(),
    lastName: z.string().max(200).optional(),
    email: z.string().email(),
  }),
  beneficiaryName: z.string().max(200).optional(),
  giftMessage: z.string().max(1000).optional(),
  // Optional — only present when the buyer also wants Luc to post a printed
  // card by hand. Never used for delivery/shipping, purely stored for that
  // manual follow-up.
  mailingAddress: z.object({
    address: z.string().max(300),
    city: z.string().max(120),
    zip: z.string().max(20),
  }).optional(),
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

export async function POST(req: NextRequest) {
  if (isRateLimited(req, { limit: 10, windowMs: 5 * 60_000 })) {
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans quelques minutes" }, { status: 429 });
  }

  const rawBody = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }
  const { packKey, buyer, beneficiaryName, giftMessage, mailingAddress } = parsed.data;
  const pack = GIFT_PACKS[packKey];
  if (!pack) {
    return NextResponse.json({ error: "Pack invalide" }, { status: 400 });
  }

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
              name: `SLY Experience — ${pack.label}`,
              description: "Carte cadeau SLY Atelier, payée en une fois. Le bénéficiaire choisit son style et réserve son rendez-vous avec Luc, sans rien payer de plus.",
            },
            unit_amount: pack.amountCents,
          },
          quantity: 1,
        },
      ],
      // sly-crm's webhook checks `kind` — "gift" activates a gift_cards row
      // rather than an orders one (see sly-crm/backend/routes/webhooks.js).
      metadata: { kind: "gift", packKey },
      customer_email: buyer.email,
      success_url: `${origin}/experience/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/experience?payment=cancelled`,
    });
  } catch (err) {
    console.error("[create-gift-checkout-session] Stripe session creation failed", err);
    return NextResponse.json({ error: "Impossible de créer la session de paiement" }, { status: 502 });
  }

  // Stage the gift card now, same reasoning as create-checkout-session's own
  // intake call: the config (here, buyer/beneficiary/message/address) has to
  // be captured server-side before redirecting, since Stripe's metadata
  // can't hold all of it. A short timeout, failure logged and swallowed —
  // the buyer must always be able to pay even if the CRM is briefly down;
  // the webhook still activates the card once staged, so a missed call here
  // only degrades to a manual reconciliation case.
  const crmUrl = process.env.SLY_CRM_URL;
  const intakeSecret = process.env.SLY_INTAKE_SECRET;
  if (crmUrl && intakeSecret) {
    try {
      await fetch(`${crmUrl}/api/gift-cards/intake`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${intakeSecret}` },
        body: JSON.stringify({
          stripeCheckoutSessionId: session.id,
          packKey,
          priceCents: pack.amountCents,
          buyer,
          beneficiaryName,
          giftMessage,
          mailingAddress,
        }),
        signal: AbortSignal.timeout(3000),
      });
    } catch (err) {
      console.error("[create-gift-checkout-session] CRM intake failed", err);
    }
  }

  return NextResponse.json({ url: session.url });
}
