"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GIFT_PACKS } from "@/lib/pricing";

const PACK_ORDER = ["pack_suit_shirt", "pack_suit_3shirts", "pack_suit_5shirts"] as const;

const PACK_DESCRIPTIONS: Record<string, string> = {
  pack_suit_shirt: "Un costume deux pièces et une chemise sur mesure — l'essentiel pour bien commencer.",
  pack_suit_3shirts: "Un costume et trois chemises — de quoi couvrir toute la semaine.",
  pack_suit_5shirts: "Un costume et cinq chemises — une garde-robe complète, offerte en une fois.",
};

const STEPS = [
  { n: "01", title: "Vous choisissez et vous payez", body: "Sélectionnez un pack et réglez-le en une fois. Aucun rendez-vous n'est réservé à cette étape — c'est un cadeau, pas une commande." },
  { n: "02", title: "Vous recevez une carte cadeau", body: "Une carte personnalisée arrive par email, avec un QR code à faire scanner à la personne que vous gagnez." },
  { n: "03", title: "Le bénéficiaire choisit et réserve", body: "Il ou elle scanne le QR code, choisit son style comme n'importe quel client, puis réserve son rendez-vous vidéo avec Luc — sans rien payer, c'est déjà réglé." },
];

export default function Experience() {
  const [selectedPack, setSelectedPack] = useState<string>("pack_suit_shirt");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [wantsPrintedCard, setWantsPrintedCard] = useState(false);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const pack = GIFT_PACKS[selectedPack];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!firstName || !lastName || !email) {
      setError("Merci de remplir vos coordonnées.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/create-gift-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packKey: selectedPack,
          buyer: { firstName, lastName, email },
          beneficiaryName: beneficiaryName || undefined,
          giftMessage: giftMessage || undefined,
          mailingAddress: wantsPrintedCard && address && city && zip ? { address, city, zip } : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "Une erreur est survenue, réessayez.");
        setSubmitting(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Une erreur est survenue, réessayez.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-[70px]">
        {/* Hero */}
        <section className="border-b border-border bg-offwhite py-20 md:py-28 px-6 md:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] uppercase tracking-[0.35em] text-choco mb-6 font-medium">Carte cadeau</p>
            <h1 className="font-brand text-5xl md:text-6xl text-ink mb-6">The SLY Experience</h1>
            <p className="text-base md:text-lg text-ink/70 leading-relaxed font-light max-w-xl mx-auto">
              Offrez l&apos;expérience d&apos;une création sur mesure avec Luc. Vous payez maintenant ;
              la personne que vous gâtez choisit son style et réserve son rendez-vous, sans rien
              débourser — le cadeau reste une surprise jusqu&apos;au bout.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-6 md:px-10 border-b border-border">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-brand text-3xl md:text-4xl text-ink mb-12 text-center">Comment ça marche</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {STEPS.map((step) => (
                <div key={step.n} className="flex flex-col gap-3">
                  <span className="font-brand text-4xl text-border leading-none">{step.n}</span>
                  <h3 className="font-medium text-ink text-base">{step.title}</h3>
                  <p className="text-sm text-muted font-light leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Packs + form */}
        <section className="py-20 px-6 md:px-10">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-brand text-3xl md:text-4xl text-ink mb-10 text-center">Choisissez votre pack</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-10">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {PACK_ORDER.map((key) => {
                  const p = GIFT_PACKS[key];
                  const active = selectedPack === key;
                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => setSelectedPack(key)}
                      className={`text-left px-6 py-6 border transition-colors flex flex-col gap-3 ${
                        active ? "border-choco bg-choco text-white" : "border-border bg-white hover:border-ink"
                      }`}
                    >
                      <p className={`text-[11px] uppercase tracking-[0.2em] ${active ? "text-white/60" : "text-muted"}`}>
                        {p.label}
                      </p>
                      <p className="font-brand text-3xl">{(p.amountCents / 100).toFixed(0)} €</p>
                      <p className={`text-xs font-light leading-relaxed ${active ? "text-white/70" : "text-muted"}`}>
                        {PACK_DESCRIPTIONS[key]}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-border pt-10 flex flex-col gap-5">
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted">Vos coordonnées</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="exp-firstName" className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2 block">Prénom</label>
                    <input id="exp-firstName" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                      className="w-full border border-border px-4 py-3 text-sm text-ink outline-none focus:border-choco transition-colors bg-white" />
                  </div>
                  <div>
                    <label htmlFor="exp-lastName" className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2 block">Nom</label>
                    <input id="exp-lastName" required value={lastName} onChange={(e) => setLastName(e.target.value)}
                      className="w-full border border-border px-4 py-3 text-sm text-ink outline-none focus:border-choco transition-colors bg-white" />
                  </div>
                </div>
                <div>
                  <label htmlFor="exp-email" className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2 block">Email</label>
                  <input id="exp-email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-border px-4 py-3 text-sm text-ink outline-none focus:border-choco transition-colors bg-white" />
                  <p className="text-xs text-muted font-light mt-2">C&apos;est ici que la carte cadeau (avec le QR code) sera envoyée.</p>
                </div>
              </div>

              <div className="border-t border-border pt-10 flex flex-col gap-5">
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted">Personnalisation (facultatif)</h3>
                <div>
                  <label htmlFor="exp-beneficiary" className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2 block">Prénom du bénéficiaire</label>
                  <input id="exp-beneficiary" value={beneficiaryName} onChange={(e) => setBeneficiaryName(e.target.value)}
                    className="w-full border border-border px-4 py-3 text-sm text-ink outline-none focus:border-choco transition-colors bg-white" />
                </div>
                <div>
                  <label htmlFor="exp-message" className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2 block">Petit mot</label>
                  <textarea id="exp-message" value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} rows={3}
                    className="w-full border border-border px-4 py-3 text-sm text-ink outline-none focus:border-choco transition-colors bg-white resize-none" />
                </div>
              </div>

              <div className="border-t border-border pt-10 flex flex-col gap-5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={wantsPrintedCard} onChange={(e) => setWantsPrintedCard(e.target.checked)} className="mt-1" />
                  <span className="text-sm text-ink font-light">
                    Je souhaite aussi qu&apos;une carte imprimée soit envoyée par courrier
                    <span className="block text-xs text-muted mt-1">Envoi fait à la main par l&apos;atelier, en plus de l&apos;email — laissez-nous une adresse.</span>
                  </span>
                </label>
                {wantsPrintedCard && (
                  <div className="flex flex-col gap-4 pl-7">
                    <input placeholder="Adresse" value={address} onChange={(e) => setAddress(e.target.value)}
                      className="w-full border border-border px-4 py-3 text-sm text-ink placeholder:text-muted/50 outline-none focus:border-choco transition-colors bg-white" />
                    <div className="grid grid-cols-2 gap-4">
                      <input placeholder="Ville" value={city} onChange={(e) => setCity(e.target.value)}
                        className="w-full border border-border px-4 py-3 text-sm text-ink placeholder:text-muted/50 outline-none focus:border-choco transition-colors bg-white" />
                      <input placeholder="Code postal" value={zip} onChange={(e) => setZip(e.target.value)}
                        className="w-full border border-border px-4 py-3 text-sm text-ink placeholder:text-muted/50 outline-none focus:border-choco transition-colors bg-white" />
                    </div>
                  </div>
                )}
              </div>

              {error && <p className="text-sm text-cherry">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-8 py-4 bg-choco text-white text-sm tracking-wide hover:bg-ink transition-colors disabled:opacity-50"
              >
                {submitting ? "Redirection vers le paiement…" : `Offrir — ${(pack.amountCents / 100).toFixed(0)} €`}
              </button>
              <p className="text-xs text-muted font-light text-center">
                Paiement sécurisé par carte. Aucun rendez-vous n&apos;est réservé à l&apos;achat.
              </p>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
