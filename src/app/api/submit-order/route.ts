import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import Stripe from "stripe";
import { z } from "zod";
import { escapeHtml } from "@/lib/html";
import { isRateLimited } from "@/lib/rate-limit";

const bodySchema = z.object({
  sessionId: z.string().min(1),
  rows: z.array(z.tuple([z.string(), z.string()])),
  name: z.string().max(200).optional(),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().max(5000).optional(),
});

export async function POST(req: NextRequest) {
  if (isRateLimited(req, { limit: 5, windowMs: 5 * 60_000 })) {
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans quelques minutes" }, { status: 429 });
  }

  const rawBody = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }
  const { sessionId, rows, name, email, message } = parsed.data;

  // Never trust a client-supplied "paid" flag — re-verify against Stripe so
  // this endpoint can't be used to send a fabricated "order paid" email.
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-06-24.dahlia" });
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return NextResponse.json({ error: "Session Stripe introuvable" }, { status: 400 });
  }
  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "Paiement non confirmé" }, { status: 402 });
  }
  const amountTotal = session.amount_total;

  const displayName = name || "Client";
  const safeName = escapeHtml(displayName);
  const safeEmail = escapeHtml(email ?? "");
  const safeMessage = message ? escapeHtml(message) : "";

  const rowsHtml = rows
    .map(([label, value]) => `<tr><td style="padding:6px 12px;color:#888;font-size:13px;">${escapeHtml(label)}</td><td style="padding:6px 12px;font-size:13px;font-weight:600;">${escapeHtml(value)}</td></tr>`)
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:560px;">
      <h2>Nouvelle commande SLY Atelier</h2>
      <p><strong>Client :</strong> ${safeName} (${safeEmail})</p>
      ${safeMessage ? `<p><strong>Message :</strong> ${safeMessage}</p>` : ""}
      <p style="color:#2a7;"><strong>Paiement confirmé : ${(amountTotal! / 100).toFixed(2)} €</strong></p>
      <table style="border-collapse:collapse;margin-top:12px;">${rowsHtml}</table>
    </div>
  `;

  const resend = new Resend(process.env.RESEND_API_KEY!);
  await resend.emails.send({
    from: `SLY Atelier <${process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev"}>`,
    to: process.env.ORDER_NOTIFICATION_EMAIL ?? "gerbetluc2218@gmail.com",
    replyTo: email || undefined,
    subject: `Nouvelle commande — ${displayName}`,
    html,
  });

  return NextResponse.json({ ok: true });
}
