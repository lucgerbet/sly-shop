import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isRateLimited } from "@/lib/rate-limit";

// Fired once, right after the client fills in name+email (the "contact"
// step, early in the configurator — see StepContact in customize/page.tsx),
// well before they'd otherwise reach payment. Forwards to sly-crm so an
// abandoned configuration is still visible to Luc, instead of vanishing
// without a trace the moment someone closes the tab.
const bodySchema = z.object({
  firstName: z.string().max(200),
  lastName: z.string().max(200),
  email: z.string().email(),
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
  const { firstName, lastName, email, type, configSummary } = parsed.data;

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
      body: JSON.stringify({ firstName, lastName, email, productType: type, configSummary }),
      signal: AbortSignal.timeout(3000),
    });
  } catch (err) {
    console.error("[lead-capture] CRM forwarding failed", err);
    return NextResponse.json({ ok: false });
  }

  return NextResponse.json({ ok: true });
}
