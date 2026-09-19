"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import Link from "next/link";

type Contact = { firstName: string; lastName: string; email: string };

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "booking" | "done" | "error">("loading");
  const [amount, setAmount] = useState<number | null>(null);
  const [booked, setBooked] = useState(false);
  // Written by /bespoke's form right before the Stripe redirect — only used
  // to prefill the Calendly widget, same reasoning as sly_config in the
  // classic configurator's success page.
  const [contact] = useState<Contact | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("sly_bespoke_contact");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/verify-session?session_id=${sessionId}`)
      .then((r) => r.json())
      .then(({ paid, amountTotal }) => {
        if (!paid) { setStatus("error"); return; }
        setAmount(amountTotal);
        setStatus("booking");
      })
      .catch(() => setStatus("error"));
  }, [sessionId]);

  useEffect(() => {
    if (status !== "booking" || booked) return;

    function onMessage(e: MessageEvent) {
      if (typeof e.data?.event !== "string" || e.data.event !== "calendly.event_scheduled" || booked) return;
      setBooked(true);
      const calendlyEventUri: string | undefined = e.data.payload?.event?.uri;

      // No /api/submit-order call here — unlike the classic configurator,
      // the CRM already received the full picture (piece, reference photos,
      // client's description) at checkout-session creation time (see
      // /api/create-bespoke-checkout-session), and its own Stripe webhook
      // already sends Luc the "deposit received" internal notification
      // unconditionally. Nothing left to send that isn't already covered.
      localStorage.removeItem("sly_bespoke_contact");
      setStatus("done");

      if (sessionId) {
        fetch("/api/appointment-booked", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stripeCheckoutSessionId: sessionId, calendlyEventUri }),
        }).catch(() => {});
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [status, booked, sessionId]);

  if (sessionId && status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="text-sm text-muted font-light">Vérification du paiement…</p>
      </div>
    );
  }

  if (!sessionId || status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="font-brand text-3xl text-ink mb-4">Paiement non confirmé</h1>
          <p className="text-sm text-muted font-light leading-relaxed mb-8">
            Nous n&apos;avons pas pu confirmer ce paiement. Si la somme a été débitée, contactez-nous.
          </p>
          <Link href="/" className="text-sm text-ink border-b border-ink pb-1 hover:text-choco hover:border-choco transition-colors">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  if (status === "booking") {
    const email = contact?.email || "";
    const name = [contact?.firstName, contact?.lastName].filter(Boolean).join(" ");
    const prefill = `${email ? `&email=${encodeURIComponent(email)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}`;
    const calendlyUrl = `https://calendly.com/gerbetluc2218/30min?hide_gdpr_banner=1&primary_color=3d2b1f${prefill}`;
    return (
      <div className="min-h-screen px-6 py-14">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <div className="w-10 h-10 bg-choco mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-base">✓</span>
            </div>
            <h1 className="font-brand text-3xl text-ink mb-2">
              Paiement de {amount ? (amount / 100).toFixed(2) : "—"} € confirmé
            </h1>
            <p className="text-sm text-muted font-light">
              Réservez votre appel vidéo avec Luc — photo de référence déjà transmise.
            </p>
          </div>
          <div className="mb-6 px-5 py-4 bg-offwhite text-sm text-ink font-light leading-relaxed">
            <strong className="font-medium">Avant le rendez-vous :</strong> ayez un mètre ruban à portée de main si possible, ça aide pour la prise de mesures.
          </div>
          <div
            className="calendly-inline-widget w-full rounded-sm overflow-hidden border border-border"
            data-url={calendlyUrl}
            style={{ minWidth: "320px", height: "700px" }}
          />
          <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="afterInteractive" />
          <p className="text-xs text-muted font-light text-center mt-4">
            Le widget ne s&apos;affiche pas ?{" "}
            <a href={calendlyUrl} target="_blank" rel="noopener noreferrer" className="text-ink border-b border-ink hover:text-choco hover:border-choco transition-colors">
              Réservez directement ici
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="w-12 h-12 bg-choco mx-auto mb-8 flex items-center justify-center">
          <span className="text-white text-xl">✓</span>
        </div>
        <h1 className="font-brand text-3xl text-ink mb-4">C&apos;est réservé</h1>
        <p className="text-sm text-muted font-light leading-relaxed mb-8">
          Votre rendez-vous est confirmé. Luc a votre photo de référence et vous retrouve à l&apos;heure convenue.
        </p>
        <Link href="/" className="text-sm text-ink border-b border-ink pb-1 hover:text-choco hover:border-choco transition-colors">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}

export default function BespokeSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="text-sm text-muted font-light">Chargement…</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
