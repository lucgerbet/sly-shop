import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isRateLimited } from "@/lib/rate-limit";

// Fired on every client-side page transition (see src/components/Analytics.tsx,
// mounted in the root layout). Proxies server-to-server to sly-crm so the
// SLY_INTAKE_SECRET never reaches the browser — same pattern as lead-capture.
// The client uses navigator.sendBeacon, so it never waits on this response.
const bodySchema = z.object({
  path: z.string().max(500),
  referrer: z.string().max(500).optional(),
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  if (isRateLimited(req, { limit: 60, windowMs: 60_000 })) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const rawBody = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const crmUrl = process.env.SLY_CRM_URL;
  const intakeSecret = process.env.SLY_INTAKE_SECRET;
  if (!crmUrl || !intakeSecret) {
    return NextResponse.json({ ok: false });
  }

  try {
    await fetch(`${crmUrl}/api/analytics/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${intakeSecret}`,
        // Forward the real visitor IP so sly-crm's daily visitor hash is
        // computed from the actual client, not from Vercel's edge IP.
        "x-forwarded-for": req.headers.get("x-forwarded-for") || "",
      },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(3000),
    });
  } catch (err) {
    console.error("[track] CRM forwarding failed", err);
    return NextResponse.json({ ok: false });
  }

  return NextResponse.json({ ok: true });
}
