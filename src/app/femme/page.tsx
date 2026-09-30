"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Femme() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Merci de renseigner votre email.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName: "",
          email,
          source: "femme-teaser",
        }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
    } catch {
      setError("Une erreur est survenue, réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-[70px]">
        <section className="relative bg-ink overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-choco/30 via-ink to-ink" />
          <div className="relative z-10 mx-auto max-w-2xl text-center px-6 py-24 md:py-32">
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/50 mb-6 font-medium">
              Univers Femme
            </p>
            <h1 className="font-brand text-5xl md:text-6xl text-white mb-6">
              Bientôt disponible
            </h1>
            <p className="text-base md:text-lg text-white/70 leading-relaxed font-light max-w-lg mx-auto mb-12">
              Le sur-mesure féminin arrive chez SLY Atelier — tailleurs, robes, manteaux et plus,
              avec le même savoir-faire et le même accompagnement personnalisé que pour l&apos;homme.
              Laissez-nous votre email pour être prévenue dès l&apos;ouverture.
            </p>

            {done ? (
              <p className="text-sm text-white/90 tracking-wide">
                Merci — vous serez prévenue dès que l&apos;univers Femme ouvre.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Prénom (facultatif)"
                  className="flex-1 border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/50 transition-colors"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre email"
                  className="flex-1 border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-white text-ink text-sm tracking-wide hover:bg-white/90 transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {submitting ? "Envoi…" : "Me prévenir"}
                </button>
              </form>
            )}
            {error && <p className="text-sm text-cherry mt-4">{error}</p>}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
