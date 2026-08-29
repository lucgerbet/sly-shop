import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isRateLimited } from "@/lib/rate-limit";
import { getCard, isValidPhone } from "@/lib/cards";

// Relay from the /carte/<slug> form to the site's existing lead route. It
// deliberately adds no capture path of its own: /api/lead-capture is what
// talks to sly-crm, and it has been doing so in production since 05/08/2026.
//
// What that route accepts (src/app/api/lead-capture/route.ts): firstName,
// lastName and email are required; phone, source, type and configSummary are
// optional. Its zod object is not .strict(), so any key outside that list is
// stripped in silence and the caller still gets ok:true — send nothing that
// isn't in it and expect it to arrive.
//
// `source` reaches clients.source and `phone` reaches clients.phone since
// 30/08/2026; before that the CRM hardcoded source and ignored phone, and
// this relay had to smuggle the card's label through `type`.

const bodySchema = z.object({
  slug: z.string().max(60),
  firstName: z.string().min(1).max(200),
  lastName: z.string().min(1).max(200),
  email: z.string().email().max(320),
  phone: z.string().max(40).refine(isValidPhone, "Numéro invalide"),
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
  const { slug, firstName, lastName, email, phone } = parsed.data;

  const card = getCard(slug);
  if (!card) return NextResponse.json({ error: "Carte inconnue" }, { status: 404 });

  // No `type`: that field means productType in the CRM, and a business card
  // is not a garment. The card is identified by `source` instead.
  const payload = {
    firstName,
    lastName,
    email,
    phone,
    source: card.leadSource,
  };

  try {
    const res = await fetch(new URL("/api/lead-capture", req.nextUrl.origin), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Without this the relay's own IP keys the downstream rate limiter,
        // so every card lead would share a single 10-per-5-minutes bucket.
        "x-forwarded-for": req.headers.get("x-forwarded-for") || "",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error("[carte/lead] lead-capture responded", res.status);
      return NextResponse.json({ ok: false });
    }
  } catch (err) {
    // Never surface this to the person standing in front of you — the page
    // hands over the contact card either way.
    console.error("[carte/lead] relay failed", err);
    return NextResponse.json({ ok: false });
  }

  return NextResponse.json({ ok: true });
}
