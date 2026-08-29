import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { isRateLimited } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  if (isRateLimited(req, { limit: 20, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans un instant" }, { status: 429 });
  }

  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id manquant" }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-06-24.dahlia" });

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return NextResponse.json({ error: "Session introuvable" }, { status: 400 });
  }

  // Only the fields the success page actually needs — no customer email here,
  // it's read from the locally-stored config instead, so this endpoint (which
  // has no auth beyond the session id itself) exposes as little as possible.
  return NextResponse.json({
    paid: session.payment_status === "paid",
    amountTotal: session.amount_total,
  });
}
