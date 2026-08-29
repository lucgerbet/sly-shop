import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isRateLimited } from "@/lib/rate-limit";

const bodySchema = z.object({
  stripeCheckoutSessionId: z.string().min(1).optional(),
  // Correlation key for a "SLY Experience" gift redemption — that order was
  // never paid through a Stripe Checkout session on this site, so there's no
  // stripeCheckoutSessionId to look it up by (see /experience/carte/[code]).
  orderId: z.string().min(1).optional(),
  startTime: z.string().optional(),
  calendlyEventUri: z.string().url().optional(),
});

// Thin server-side proxy, same pattern as submit-order — the browser calls
// this same-origin route (no secret needed client-side), which forwards to
// the CRM with SLY_INTAKE_SECRET attached server-side only. Never exposes
// the intake secret to the browser.
export async function POST(req: NextRequest) {
  if (isRateLimited(req, { limit: 10, windowMs: 5 * 60_000 })) {
    return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });
  }

  const rawBody = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, reason: "invalid_body" }, { status: 400 });
  }
  const { stripeCheckoutSessionId, orderId, startTime, calendlyEventUri } = parsed.data;

  const crmUrl = process.env.SLY_CRM_URL;
  const intakeSecret = process.env.SLY_INTAKE_SECRET;
  if (!crmUrl || !intakeSecret) {
    // Not configured — degrade silently, same posture as submit-order having
    // no persistence today. The customer's booking still went through on
    // Calendly's side regardless.
    return NextResponse.json({ ok: false, reason: "CRM not configured" });
  }

  try {
    const res = await fetch(`${crmUrl}/api/appointments/from-widget`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${intakeSecret}` },
      body: JSON.stringify({ stripeCheckoutSessionId, orderId, startTime, calendlyEventUri }),
      signal: AbortSignal.timeout(5000),
    });
    const ok = res.ok;
    if (!ok) console.error("[appointment-booked] CRM responded", res.status, await res.text());
    return NextResponse.json({ ok });
  } catch (err) {
    console.error("[appointment-booked] CRM call failed", err);
    return NextResponse.json({ ok: false });
  }
}
