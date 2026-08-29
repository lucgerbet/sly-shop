"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    if (!sessionId) { setStatus("error"); return; }
    fetch(`/api/verify-session?session_id=${sessionId}`)
      .then((r) => r.json())
      .then(({ paid }) => setStatus(paid ? "done" : "error"))
      .catch(() => setStatus("error"));
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="text-sm text-muted font-light">Vérification du paiement…</p>
      </div>
    );
  }

  if (status === "error") {
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

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="w-12 h-12 bg-choco mx-auto mb-8 flex items-center justify-center">
          <span className="text-white text-xl">✓</span>
        </div>
        <h1 className="font-brand text-3xl text-ink mb-4">Merci pour ce cadeau</h1>
        <p className="text-sm text-muted font-light leading-relaxed mb-8">
          Votre SLY Experience est prête. Une carte cadeau personnalisée, avec son QR code, vient de
          partir par email. Il ne vous reste qu&apos;à la faire scanner à la personne que vous gâtez —
          elle choisira son style et réservera son rendez-vous avec Luc, sans rien avoir à payer.
        </p>
        <Link href="/" className="text-sm text-ink border-b border-ink pb-1 hover:text-choco hover:border-choco transition-colors">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}

export default function ExperienceSuccess() {
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
