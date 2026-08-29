import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isRateLimited } from "@/lib/rate-limit";

const bodySchema = z.object({
  giftCode: z.string().min(1),
  customer: z.object({
    firstName: z.string().max(200).optional(),
    lastName: z.string().max(200).optional(),
    email: z.string().email(),
  }),
  config: z.record(z.string(), z.unknown()).optional(),
  configSummary: z.array(z.tuple([z.string(), z.string()])).optional(),
});

// Called from StepPayment's gift-mode button instead of create-checkout-session
// — there is no Stripe charge here at all, the pack was already paid for at
// gift-purchase time. This single call both creates the paid order and marks
// the gift code redeemed (see sly-crm's POST /api/gift-cards/:code/redeem);
// the code itself is re-validated server-side there regardless of what the
// redemption page already showed, so a stale/tampered client can't create an
// order from an expired or already-used code.
export async function POST(req: NextRequest) {
  if (isRateLimited(req, { limit: 10, windowMs: 5 * 60_000 })) {
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans quelques minutes" }, { status: 429 });
  }

  const rawBody = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }
  const { giftCode, customer, config, configSummary } = parsed.data;

  const crmUrl = process.env.SLY_CRM_URL;
  const intakeSecret = process.env.SLY_INTAKE_SECRET;
  if (!crmUrl || !intakeSecret) {
    return NextResponse.json({ error: "Service indisponible" }, { status: 503 });
  }

  try {
    const res = await fetch(`${crmUrl}/api/gift-cards/${encodeURIComponent(giftCode)}/redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${intakeSecret}` },
      body: JSON.stringify({ customer, config, configSummary }),
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data?.error || "redeem_failed" }, { status: res.status });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("[redeem-gift-order] CRM call failed", err);
    return NextResponse.json({ error: "Impossible de valider la carte cadeau" }, { status: 502 });
  }
}
