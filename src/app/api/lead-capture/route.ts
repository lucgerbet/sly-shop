import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isRateLimited } from "@/lib/rate-limit";

// Fired once, right after the client fills in name+email (the "contact"
// step, early in the configurator — see StepContact in customize/page.tsx),
// well before they'd otherwise reach payment. Forwards to sly-crm so an
// abandoned configuration is still visible to Luc, instead of vanishing
// without a trace the moment someone closes the tab.
//
// Also the single entry point for every other capture surface on the site,
// which is why `source` and `phone` exist below — see the /carte relay in
// src/app/api/carte/lead/route.ts. There is deliberately no second route
// into the CRM.
const bodySchema = z.object({
  firstName: z.string().max(200),
  lastName: z.string().max(200),
  email: z.string().email(),
  // Both optional so the configurator's own call is untouched: omit them and
  // sly-crm still stamps source 'sly-shop-lead' and leaves phone empty,
  // exactly as before. Sent by capture surfaces that aren't the configurator
  // — the /carte business cards being the first.
  phone: z.string().max(40).optional(),
  source: z.string().max(50).optional(),
  type: z.string().max(50).optional(),
  configSummary: z.array(z.tuple([z.string(), z.string()])).optional(),
});

export async function POST(req: NextRequest) {
  if (isRateLimited(req, { limit: 10, windowMs: 5 * 60_000 })) {
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans quelques minutes" }, { status: 429 });
  }

  const rawBody = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }
  const { firstName, lastName, email, phone, source, type, configSummary } = parsed.data;

  const crmUrl = process.env.SLY_CRM_URL;
  const intakeSecret = process.env.SLY_INTAKE_SECRET;
  if (!crmUrl || !intakeSecret) {
    // Not configured locally / in this environment — never block the client
    // over a missing CRM connection, just skip silently.
    return NextResponse.json({ ok: false });
  }

  try {
    await fetch(`${crmUrl}/api/leads/capture`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${intakeSecret}` },
      body: JSON.stringify({ firstName, lastName, email, phone, source, productType: type, configSummary }),
      signal: AbortSignal.timeout(3000),
    });
  } catch (err) {
    console.error("[lead-capture] CRM forwarding failed", err);
    return NextResponse.json({ ok: false });
  }

  return NextResponse.json({ ok: true });
}
