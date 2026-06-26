"use client";

import { useState } from "react";
import Link from "next/link";

/* ─── Data ──────────────────────────────────────────────────── */

const TYPES = [
  { id: "suit", label: "Costume Deux Pièces", sub: "Blazer + Pantalon", price: "550 €" },
  { id: "blazer", label: "Blazer", sub: "Haut uniquement", price: "320 €" },
  { id: "trousers", label: "Pantalon", sub: "Bas uniquement", price: "230 €" },
];

const STYLES = [
  { id: "classic", label: "Classique", sub: "Coupe droite, épaules naturelles, intemporel" },
  { id: "slim", label: "Slim", sub: "Silhouette ajustée, moderne, épuré" },
  { id: "relaxed", label: "Relaxed", sub: "Coupe ample, décontractée, contemporaine" },
];

const COLORS = [
  { id: "navy", label: "Bleu Marine", hex: "#1a2744" },
  { id: "charcoal", label: "Gris Anthracite", hex: "#3a3a3a" },
  { id: "black", label: "Noir", hex: "#111111" },
  { id: "camel", label: "Camel", hex: "#b8864e" },
  { id: "brown", label: "Marron", hex: "#5c3d2e" },
  { id: "beige", label: "Beige", hex: "#c8b49a" },
];

type Config = {
  type: string;
  style: string;
  color: string;
  name: string;
  email: string;
  message: string;
};

/* ─── Step indicator ─────────────────────────────────────────── */

function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-0 mb-12">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div
            className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-medium transition-colors shrink-0 ${
              i < current
                ? "bg-choco border-choco text-white"
                : i === current
                ? "bg-white border-ink text-ink"
                : "bg-white border-border text-muted"
            }`}
          >
            {i < current ? "✓" : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`flex-1 h-px mx-2 ${i < current ? "bg-choco" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Steps ──────────────────────────────────────────────────── */

function Step1({ config, set }: { config: Config; set: (k: keyof Config, v: string) => void }) {
  return (
    <div>
      <h2 className="font-brand text-3xl md:text-4xl text-ink mb-2">Que souhaitez-vous commander ?</h2>
      <p className="text-sm text-muted mb-10 font-light">Choisissez votre pièce principale.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => set("type", t.id)}
            className={`text-left p-8 border transition-colors ${
              config.type === t.id
                ? "border-choco bg-choco text-white"
                : "border-border bg-white hover:border-ink"
            }`}
          >
            <p className={`text-[10px] uppercase tracking-[0.3em] mb-3 ${config.type === t.id ? "text-white/60" : "text-muted"}`}>
              {t.sub}
            </p>
            <p className={`font-brand text-2xl mb-2 ${config.type === t.id ? "text-white" : "text-ink"}`}>
              {t.label}
            </p>
            <p className={`text-lg font-medium ${config.type === t.id ? "text-white" : "text-cherry"}`}>
              {t.price}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step2({ config, set }: { config: Config; set: (k: keyof Config, v: string) => void }) {
  return (
    <div>
      <h2 className="font-brand text-3xl md:text-4xl text-ink mb-2">Quelle coupe préférez-vous ?</h2>
      <p className="text-sm text-muted mb-10 font-light">Vous affinerez les détails avec Luc lors du rendez-vous.</p>
      <div className="flex flex-col gap-3">
        {STYLES.map((s) => (
          <button
            key={s.id}
            onClick={() => set("style", s.id)}
            className={`text-left px-8 py-6 border flex items-center gap-6 transition-colors ${
              config.style === s.id
                ? "border-choco bg-choco text-white"
                : "border-border bg-white hover:border-ink"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                config.style === s.id ? "border-white" : "border-border"
              }`}
            >
              {config.style === s.id && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
            </div>
            <div>
              <p className={`font-medium text-base mb-0.5 ${config.style === s.id ? "text-white" : "text-ink"}`}>
                {s.label}
              </p>
              <p className={`text-sm font-light ${config.style === s.id ? "text-white/70" : "text-muted"}`}>
                {s.sub}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step3({ config, set }: { config: Config; set: (k: keyof Config, v: string) => void }) {
  return (
    <div>
      <h2 className="font-brand text-3xl md:text-4xl text-ink mb-2">Quelle couleur principale ?</h2>
      <p className="text-sm text-muted mb-10 font-light">Nous affinerons le tissu et la nuance exacte avec Luc.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {COLORS.map((c) => (
          <button
            key={c.id}
            onClick={() => set("color", c.id)}
            className={`text-left p-5 border transition-colors ${
              config.color === c.id ? "border-choco" : "border-border hover:border-ink"
            }`}
          >
            <div
              className="w-full aspect-square mb-4 rounded-sm"
              style={{ background: c.hex }}
            />
            <div className="flex items-center gap-2">
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                  config.color === c.id ? "border-choco" : "border-border"
                }`}
              >
                {config.color === c.id && (
                  <div className="w-2 h-2 rounded-full bg-choco" />
                )}
              </div>
              <p className="text-sm text-ink font-medium">{c.label}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step4({
  config,
  set,
  onSubmit,
}: {
  config: Config;
  set: (k: keyof Config, v: string) => void;
  onSubmit: () => void;
}) {
  const selectedType = TYPES.find((t) => t.id === config.type);
  const selectedStyle = STYLES.find((s) => s.id === config.style);
  const selectedColor = COLORS.find((c) => c.id === config.color);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Summary */}
      <div>
        <h2 className="font-brand text-3xl md:text-4xl text-ink mb-8">Votre résumé</h2>
        <div className="border border-border divide-y divide-border mb-8">
          {[
            ["Pièce", selectedType?.label ?? "—"],
            ["Coupe", selectedStyle?.label ?? "—"],
            ["Couleur", selectedColor?.label ?? "—"],
            ["Prix", selectedType?.price ?? "—"],
            ["Délai", "2 – 3 semaines"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between px-6 py-4">
              <span className="text-sm text-muted font-light">{label}</span>
              <span className="text-sm text-ink font-medium">{value}</span>
            </div>
          ))}
        </div>
        <div className="bg-offwhite p-5 text-sm text-muted font-light leading-relaxed">
          <strong className="text-ink font-medium">Prochaine étape :</strong> Luc vous contactera
          dans les 24h pour fixer votre rendez-vous vidéo et prendre vos mesures ensemble.
        </div>
      </div>

      {/* Contact form */}
      <div>
        <h2 className="font-brand text-3xl md:text-4xl text-ink mb-8">Vos coordonnées</h2>
        <form
          onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
          className="flex flex-col gap-5"
        >
          <div>
            <label className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2 block">
              Nom complet
            </label>
            <input
              required
              value={config.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Jean Dupont"
              className="w-full border border-border px-4 py-3 text-sm text-ink placeholder:text-muted/40 outline-none focus:border-choco transition-colors bg-white"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2 block">
              Email
            </label>
            <input
              required
              type="email"
              value={config.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="jean@email.com"
              className="w-full border border-border px-4 py-3 text-sm text-ink placeholder:text-muted/40 outline-none focus:border-choco transition-colors bg-white"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2 block">
              Message (optionnel)
            </label>
            <textarea
              rows={3}
              value={config.message}
              onChange={(e) => set("message", e.target.value)}
              placeholder="Occasion spéciale, délai souhaité, questions..."
              className="w-full border border-border px-4 py-3 text-sm text-ink placeholder:text-muted/40 outline-none focus:border-choco transition-colors bg-white resize-none"
            />
          </div>
          <button
            type="submit"
            className="mt-2 px-8 py-4 bg-choco text-white text-sm tracking-wide hover:bg-ink transition-colors"
          >
            Envoyer ma demande
          </button>
          <p className="text-xs text-muted font-light">
            En envoyant ce formulaire, vous acceptez d&apos;être contacté par Luc dans les 24h.
          </p>
        </form>
      </div>
    </div>
  );
}

/* ─── Main configurator ──────────────────────────────────────── */

const STEP_LABELS = ["Pièce", "Coupe", "Couleur", "Rendez-vous"];

export default function Customize() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [config, setConfig] = useState<Config>({
    type: "",
    style: "",
    color: "",
    name: "",
    email: "",
    message: "",
  });

  const set = (k: keyof Config, v: string) => setConfig((c) => ({ ...c, [k]: v }));

  const canNext = [
    !!config.type,
    !!config.style,
    !!config.color,
    true,
  ][step];

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="w-12 h-12 bg-choco mx-auto mb-8 flex items-center justify-center">
            <span className="text-white text-xl">✓</span>
          </div>
          <h1 className="font-brand text-3xl text-ink mb-4">Demande reçue.</h1>
          <p className="text-sm text-muted font-light leading-relaxed mb-8">
            Merci {config.name}. Luc vous contactera dans les 24h à l&apos;adresse{" "}
            <strong className="text-ink">{config.email}</strong> pour fixer
            votre rendez-vous.
          </p>
          <Link href="/" className="text-sm text-ink border-b border-ink pb-1 hover:text-choco hover:border-choco transition-colors">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="border-b border-border bg-white sticky top-0 z-40">
        <div className="mx-auto max-w-5xl px-6 md:px-10 h-[70px] flex items-center justify-between">
          <Link href="/" className="font-brand text-xl tracking-[0.15em] uppercase text-ink">
            SLY Atelier
          </Link>
          <div className="hidden sm:flex items-center gap-3">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-3">
                <span className={`text-xs tracking-wide ${i === step ? "text-ink font-medium" : "text-muted"}`}>
                  {label}
                </span>
                {i < STEP_LABELS.length - 1 && <span className="text-border">—</span>}
              </div>
            ))}
          </div>
          <Link href="/" className="text-xs text-muted hover:text-ink transition-colors">
            Quitter
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-6 md:px-10 py-14 md:py-20">
        <StepBar current={step} total={STEP_LABELS.length} />

        {step === 0 && <Step1 config={config} set={set} />}
        {step === 1 && <Step2 config={config} set={set} />}
        {step === 2 && <Step3 config={config} set={set} />}
        {step === 3 && <Step4 config={config} set={set} onSubmit={() => setSubmitted(true)} />}

        {/* Navigation */}
        {step < 3 && (
          <div className="mt-12 flex items-center justify-between">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="text-sm text-muted hover:text-ink transition-colors disabled:opacity-30"
            >
              ← Retour
            </button>
            <button
              onClick={() => setStep((s) => Math.min(3, s + 1))}
              disabled={!canNext}
              className="px-8 py-3.5 bg-choco text-white text-sm tracking-wide hover:bg-ink transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Continuer →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
