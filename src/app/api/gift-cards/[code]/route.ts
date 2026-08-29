import { NextRequest, NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";

// Thin server-side proxy, same pattern as appointment-booked — the browser
// (and the redemption page's server component) call this same-origin route,
// which forwards to the CRM with SLY_INTAKE_SECRET attached server-side
// only. The code itself is the only "auth" a visitor needs — anyone holding
// it is meant to be able to see the card, same trust model as the
// satisfaction-survey token.
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  if (isRateLimited(req, { limit: 20, windowMs: 5 * 60_000 })) {
    return NextResponse.json({ valid: false, reason: "rate_limited" }, { status: 429 });
  }

  const { code } = await params;
  const crmUrl = process.env.SLY_CRM_URL;
  const intakeSecret = process.env.SLY_INTAKE_SECRET;
  if (!crmUrl || !intakeSecret) {
    return NextResponse.json({ valid: false, reason: "not_configured" }, { status: 503 });
  }

  try {
    const res = await fetch(`${crmUrl}/api/gift-cards/${encodeURIComponent(code)}`, {
      headers: { Authorization: `Bearer ${intakeSecret}` },
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[gift-cards/[code]] CRM call failed", err);
    return NextResponse.json({ valid: false, reason: "error" }, { status: 502 });
  }
}
