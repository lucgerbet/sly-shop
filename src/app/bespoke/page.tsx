"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PRICES, DEPOSIT_CENTS } from "@/lib/pricing";

const BESPOKE_TYPES = ["suit", "blazer", "trousers", "shirt"] as const;
type BespokeType = (typeof BESPOKE_TYPES)[number];

const TYPE_DESCRIPTIONS: Record<BespokeType, string> = {
  suit: "Costume deux pièces — veste et pantalon.",
  blazer: "Une veste seule, sans pantalon assorti.",
  trousers: "Un pantalon seul.",
  shirt: "Une chemise, réglée en une fois.",
};

const STEPS = [
  { n: "01", title: "Vous envoyez une photo", body: "La pièce que vous adorez et voulez retrouver à l'identique, ou une inspiration trouvée ailleurs (magazine, réseaux, vitrine...)." },
  { n: "02", title: "Vous réservez, même prix qu'en configurateur", body: "Le tarif est exactement celui de la pièce choisie — rien de plus pour la reproduction." },
  { n: "03", title: "Luc retrouve la pièce avec vous", body: "Pendant l'appel vidéo, photo sous les yeux : tissu, coupe et finitions se calent ensemble, puis prise de mesures." },
];

type PhotoEntry = { key: string; file: File; url?: string; uploading: boolean; error?: string };

export default function Bespoke() {
  const [type, setType] = useState<BespokeType>("suit");
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [notes, setNotes] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const item = PRICES[type];
  const isFullPayment = item.paymentMode === "full";
  const chargeCents = isFullPayment ? item.amountCents : DEPOSIT_CENTS;
  const uploadedUrls = photos.filter((p) => p.url).map((p) => p.url!);
  const stillUploading = photos.some((p) => p.uploading);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList).slice(0, Math.max(0, 5 - photos.length));
    for (const file of files) {
      const key = `${file.name}-${file.size}-${Date.now()}`;
      setPhotos((prev) => [...prev, { key, file, uploading: true }]);
      try {
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/bespoke-upload",
        });
        setPhotos((prev) => prev.map((p) => (p.key === key ? { ...p, uploading: false, url: blob.url } : p)));
      } catch {
        setPhotos((prev) => prev.map((p) => (p.key === key ? { ...p, uploading: false, error: "Échec de l'envoi" } : p)));
      }
    }
  }

  function removePhoto(key: string) {
    setPhotos((prev) => prev.filter((p) => p.key !== key));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!firstName || !lastName || !email) {
      setError("Merci de remplir vos coordonnées.");
      return;
    }
    if (uploadedUrls.length === 0) {
      setError("Merci d'ajouter au moins une photo.");
      return;
    }
    setSubmitting(true);
    // Read back by /bespoke/success purely to prefill the Calendly widget —
    // same reasoning as sly_config in the classic configurator's flow.
    localStorage.setItem("sly_bespoke_contact", JSON.stringify({ firstName, lastName, email }));
    try {
      const res = await fetch("/api/create-bespoke-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          customer: { firstName, lastName, email },
          notes: notes || undefined,
          photoUrls: uploadedUrls,
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
            <p className="text-[11px] uppercase tracking-[0.35em] text-choco mb-6 font-medium">Bespoke</p>
            <h1 className="font-brand text-5xl md:text-6xl text-ink mb-6">Reproduisez une pièce</h1>
            <p className="text-base md:text-lg text-ink/70 leading-relaxed font-light max-w-xl mx-auto">
              Une pièce que vous adorez et ne trouvez plus, ou une inspiration repérée quelque part —
              envoyez-nous une photo, on la retrouve pour vous, sur mesure, au même prix que le configurateur classique.
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

        {/* Form */}
        <section className="py-20 px-6 md:px-10">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-brand text-3xl md:text-4xl text-ink mb-10 text-center">Votre demande</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-10">
              <div>
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted mb-4">Quelle pièce reproduire ?</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {BESPOKE_TYPES.map((t) => {
                    const active = type === t;
                    return (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setType(t)}
                        className={`text-left px-5 py-5 border transition-colors flex flex-col gap-2 ${
                          active ? "border-choco bg-choco text-white" : "border-border bg-white hover:border-ink"
                        }`}
                      >
                        <p className="font-brand text-xl">{PRICES[t].label}</p>
                        <p className={`text-xs font-light leading-relaxed ${active ? "text-white/70" : "text-muted"}`}>
                          {TYPE_DESCRIPTIONS[t]}
                        </p>
                        <p className={`text-sm font-medium mt-1 ${active ? "text-white" : "text-cherry"}`}>
                          {(PRICES[t].amountCents / 100).toFixed(0)} €
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-border pt-10 flex flex-col gap-5">
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted">Votre ou vos photo(s)</h3>
                <p className="text-xs text-muted font-light -mt-2">
                  La pièce que vous voulez retrouver, ou votre inspiration. 5 photos maximum.
                </p>
                <label className="border border-dashed border-border hover:border-ink transition-colors px-6 py-10 text-center cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic"
                    multiple
                    className="hidden"
                    disabled={photos.length >= 5}
                    onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
                  />
                  <span className="text-sm text-ink">
                    {photos.length >= 5 ? "Maximum atteint" : "Cliquez pour ajouter une photo"}
                  </span>
                </label>
                {photos.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {photos.map((p) => (
                      <div key={p.key} className="relative aspect-square border border-border bg-offwhite overflow-hidden">
                        {p.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted font-light px-2 text-center">
                            {p.uploading ? "Envoi…" : p.error || "Erreur"}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removePhoto(p.key)}
                          className="absolute top-1 right-1 w-5 h-5 bg-ink/70 text-white text-xs flex items-center justify-center hover:bg-ink"
                          aria-label="Retirer cette photo"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-10 flex flex-col gap-5">
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted">Décrivez-la (facultatif)</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Où vous l'avez vue, ce que vous aimez dedans, tout détail utile pour Luc…"
                  className="w-full border border-border px-4 py-3 text-sm text-ink placeholder:text-muted/50 outline-none focus:border-choco transition-colors bg-white resize-none"
                />
              </div>

              <div className="border-t border-border pt-10 flex flex-col gap-5">
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted">Vos coordonnées</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="bespoke-firstName" className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2 block">Prénom</label>
                    <input id="bespoke-firstName" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                      className="w-full border border-border px-4 py-3 text-sm text-ink outline-none focus:border-choco transition-colors bg-white" />
                  </div>
                  <div>
                    <label htmlFor="bespoke-lastName" className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2 block">Nom</label>
                    <input id="bespoke-lastName" required value={lastName} onChange={(e) => setLastName(e.target.value)}
                      className="w-full border border-border px-4 py-3 text-sm text-ink outline-none focus:border-choco transition-colors bg-white" />
                  </div>
                </div>
                <div>
                  <label htmlFor="bespoke-email" className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2 block">Email</label>
                  <input id="bespoke-email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-border px-4 py-3 text-sm text-ink outline-none focus:border-choco transition-colors bg-white" />
                </div>
              </div>

              <div className="border-t border-border pt-10">
                <div className="mb-6 px-5 py-4 bg-offwhite text-sm text-ink font-light leading-relaxed flex justify-between items-center gap-4">
                  <span>
                    {isFullPayment
                      ? <>Paiement complet — <strong className="font-medium">{item.label}</strong></>
                      : <>Acompte de réservation — <strong className="font-medium">{item.label}</strong>, {(item.amountCents / 100).toFixed(0)} € au total</>}
                  </span>
                  <span className="text-base font-medium text-ink shrink-0">{(chargeCents / 100).toFixed(0)} €</span>
                </div>

                {error && <p className="text-sm text-cherry mb-4">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting || stillUploading}
                  className="w-full px-8 py-4 bg-choco text-white text-sm tracking-wide hover:bg-ink transition-colors disabled:opacity-50"
                >
                  {submitting ? "Redirection vers le paiement…" : stillUploading ? "Envoi des photos…" : `Payer et réserver — ${(chargeCents / 100).toFixed(0)} €`}
                </button>
                <p className="text-xs text-muted font-light text-center mt-4">
                  Paiement sécurisé par carte. Le rendez-vous vidéo avec Luc se réserve juste après.
                </p>
              </div>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
