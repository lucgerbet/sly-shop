// paymentMode "deposit": the classic flow — 150€ charged now to book the
// video appointment, the rest invoiced by Luc as a balance after the call.
// paymentMode "full": the whole price is charged now, no separate balance —
// used for the shirt (135€ is too small a ticket to split into a deposit
// bigger than the item itself would ever make sense as a "deposit").
export const PRICES: Record<string, { label: string; amountCents: number; paymentMode: "deposit" | "full" }> = {
  suit: { label: "Costume Deux Pièces", amountCents: 64500, paymentMode: "deposit" },
  blazer: { label: "Blazer sur mesure", amountCents: 47500, paymentMode: "deposit" },
  trousers: { label: "Pantalon sur mesure", amountCents: 19900, paymentMode: "deposit" },
  shirt: { label: "Chemise sur mesure", amountCents: 13500, paymentMode: "full" },
};

// Deposit charged at booking, for paymentMode "deposit" types only. Half is
// non-refundable if the order is not finalised after the video appointment;
// the rest is deducted from the total.
export const DEPOSIT_CENTS = 15000;
export const DEPOSIT_REFUNDABLE_CENTS = 7500;

// The 150€ deposit above is flat regardless of a promo code — a code only
// changes the *total* price, which only actually gets charged as the balance
// Luc invoices manually after the fitting call (see sly-crm's
// /api/orders/finalize, which takes totalAmountCents from Luc directly —
// there's no automated total-price plumbing to keep in sync here). What
// matters on this side is that the discount is visible everywhere the price
// is shown, and recorded in the order summary sent to the CRM so Luc knows
// to invoice 575€ instead of 645€.
export const PROMO_CODES: Record<string, { label: string; priceCents: number; appliesTo: string[] }> = {
  AMI: { label: "Tarif ami", priceCents: 57500, appliesTo: ["suit"] },
};

export function resolvePromoCode(type: string, rawCode: string): { code: string; label: string; priceCents: number } | null {
  const code = rawCode.trim().toUpperCase();
  if (!code) return null;
  const entry = PROMO_CODES[code];
  if (!entry || !entry.appliesTo.includes(type)) return null;
  return { code, label: entry.label, priceCents: entry.priceCents };
}

// The effective total price to display for a given piece + (optional) promo
// code — the single place PriceBar, StepPayment and the order summary all
// read from, so they can never disagree with each other.
export function getDisplayPriceCents(type: string, promoCode: string): number {
  const promo = resolvePromoCode(type, promoCode);
  return promo?.priceCents ?? PRICES[type]?.amountCents ?? 0;
}
