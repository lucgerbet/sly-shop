// Digital business cards, one entry per card. Handed over face to face: the
// other person scans a QR pointing at /carte/<slug>, leaves their details
// (which reach the CRM through the existing /api/lead-capture route), and
// gets the contact file back to save in one tap.
//
// Deliberately a plain in-code map rather than a CMS or a DB table: there is
// one card today, and a card only changes when someone's job title or phone
// number does.

export type Card = {
  slug: string;
  firstName: string;
  lastName: string;
  role: string;
  company: string;
  email: string;
  /** E.164, used verbatim in the vCard TEL field. Empty = no TEL line. */
  phone: string;
  /** How the number is shown on screen. Empty = the phone line is hidden. */
  phoneDisplay: string;
  /** One line, shown under the name. */
  tagline: string;
  /** Label written into the CRM so these leads are tellable apart from
   *  configurator leads — see src/app/api/carte/lead/route.ts. */
  leadSource: string;
};

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sly-atelier.com";

export const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/gerbetluc2218/30min";

// The configurator lives at /customize, and ?type=suit deep-links straight
// past the "type" step onto the colour step (see the goNext() skip in
// src/app/[locale]/customize/page.tsx). French is unprefixed —
// localePrefix: "as-needed" in src/i18n/routing.ts.
export const CONFIGURATOR_SUIT_URL = "/customize?type=suit";

export const PRIVACY_URL = "/confidentialite";

export const CARDS: Record<string, Card> = {
  luc: {
    slug: "luc",
    firstName: "Luc",
    lastName: "Gerbet",
    role: "Fondateur",
    company: "SLY Atelier",
    email: "contact@sly-atelier.com",
    // E.164 for the vCard TEL field and the tel: link; the display form is
    // what actually appears on screen. Also the WhatsApp number.
    phone: "+33640702528",
    phoneDisplay: "+33 6 40 70 25 28",
    tagline: "Costumes et chemises sur mesure.",
    leadSource: "carte-luc",
  },
};

export function getCard(slug: string): Card | undefined {
  return CARDS[slug];
}

export function fullName(card: Card): string {
  return `${card.firstName} ${card.lastName}`;
}

// Shared by the form and by /api/carte/lead so the browser and the server
// can never disagree on what counts as valid.
export function normalizePhone(input: string): string {
  return input.replace(/[\s.\-()]/g, "");
}

export function isValidPhone(input: string): boolean {
  const n = normalizePhone(input);
  // Permissive on formatting, strict on shape: an optional leading + or 00,
  // then 8–15 digits. Covers French national (0612345678) and international
  // (+33 6 12 34 56 78) without pretending to know every country's plan.
  return /^(?:\+|00)?\d{8,15}$/.test(n);
}

export function isValidEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.trim());
}
