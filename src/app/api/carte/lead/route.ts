import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isRateLimited } from "@/lib/rate-limit";
import { getCard, fullName, isValidPhone } from "@/lib/cards";

// Relay from the /carte/<slug> form to the site's existing lead route. It
// deliberately adds no capture path of its own: /api/lead-capture is what
// talks to sly-crm, and it has been doing so in production since 05/08/2026.
//
// WHAT THE TARGET ACTUALLY ACCEPTS (src/app/api/lead-capture/route.ts):
//   firstName  string, REQUIRED
//   lastName   string, REQUIRED
//   email      valid email, REQUIRED
//   type       string <= 50, optional  -> forwarded to the CRM as productType
//   configSummary  [string, string][], optional
// Its zod schema is not strict, so anything else — phone, source, notes — is
// dropped in silence and the caller still gets ok:true. Hence: no phone,
// source or notes key below. They would look like they worked and vanish.
//
// WHY source TRAVELS AS type: sly-crm's /api/leads/capture hardcodes
// source: 'sly-shop-lead' on the client it creates (backend/routes/leads.js),
// so nothing a caller sends can reach clients.source. Passing the card's
// label as `type` puts it in the lead_capture message the CRM writes
// ("Configuration démarrée sur le site (carte-luc)"), which is the only way
// to tell these leads from configurator abandons without editing a route
// that is live in production.
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

  const payload = {
    firstName,
    lastName,
    email,
    type: card.leadSource,
    // The only channel that carries free-form detail through to the CRM: it
    // is rendered into the lead_capture message body, so the phone number is
    // at least readable by a human even though findOrCreateClient never
    // writes the clients.phone column.
    configSummary: [
      ["Origine", `Carte de visite — ${fullName(card)}`],
      ["Téléphone", phone],
    ],
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
