import { NextRequest, NextResponse } from "next/server";
import { SITE_URL, getCard, fullName } from "@/lib/cards";

// Serves the contact file behind "Enregistrer mon contact" on /carte/<slug>.
// vCard 3.0 rather than 4.0: it is what the iOS and Android address books
// import without complaint, which is the only environment this ever runs in.

// RFC 2426 §2.4.2 — backslash, comma, semicolon and newline are the four
// characters that carry structural meaning inside a property value.
function escape(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = getCard(slug);
  if (!card) return NextResponse.json({ error: "Carte inconnue" }, { status: 404 });

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escape(card.lastName)};${escape(card.firstName)};;;`,
    `FN:${escape(fullName(card))}`,
    `ORG:${escape(card.company)}`,
    `TITLE:${escape(card.role)}`,
    `EMAIL;TYPE=INTERNET,WORK:${escape(card.email)}`,
    ...(card.phone ? [`TEL;TYPE=CELL,WORK:${escape(card.phone)}`] : []),
    `URL:${escape(SITE_URL)}`,
    `NOTE:${escape(card.tagline)}`,
    "END:VCARD",
  ];

  // CRLF is what the spec mandates, and some Android importers do reject LF.
  const body = lines.join("\r\n") + "\r\n";

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.vcf"`,
      "Cache-Control": "public, max-age=3600",
      "X-Robots-Tag": "noindex",
    },
  });
}
