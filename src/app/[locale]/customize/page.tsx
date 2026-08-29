"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import OffersDropdown from "@/components/OffersDropdown";
import {
  OCCASIONS, TYPES, TROUSER_CUTS, JACKET_CUT_TO_TROUSER_CUT, JACKET_STYLES, JACKET_CUTS,
  WAISTBANDS, WAIST_SIZES, PLEATS, HEMS, CLOSURES, LININGS,
  MONOGRAM_PLACEMENTS, MONOGRAM_COLORS, PATTERNS, BUTTON_MATERIALS,
  LAPELS, LAPEL_WIDTHS, WAISTBAND_WIDTHS,
  SHIRT_FABRICS, SHIRT_FITS, SHIRT_COLLARS, SHIRT_CUFFS, SHIRT_MONOGRAM_PLACEMENTS,
  PHASES, buildSteps,
  type Config, type StepKey, type StepDef, type ProductType,
} from "./data";
import { buildSummaryRows } from "./summary";
import { frConfiguratorT } from "./frTranslator";
import { isStepValid } from "./validation";
import { useLocalizedOptions, useLocalizedColorFamilies, useLocalizedMonogramColors } from "./useLocalizedOptions";
import { PRICES, DEPOSIT_CENTS, DEPOSIT_REFUNDABLE_CENTS, getDisplayPriceCents, resolvePromoCode, GIFT_PACKS } from "@/lib/pricing";

// Set once a valid ?giftCode= is confirmed against the CRM — see the
// giftCode effect in CustomizeInner. null means either no code in the URL,
// or one that's still being validated / turned out invalid.
type GiftState = { code: string; packKey: string; packLabel: string } | null;

/* ─── Step bar ───────────────────────────────────────────────── */

/* Sticky price bar — keeps the price visible during the whole configuration,
   removing pricing anxiety mid-tunnel. Hidden on payment/summary (they have
   their own breakdown). */
function PriceBar({ config, currentKey, gift }: { config: Config; currentKey: StepKey; gift: GiftState }) {
  const t = useTranslations("Configurator.priceBar");
  const types = useLocalizedOptions("types", TYPES);
  const selectedType = types.find((ty) => ty.id === config.type);
  if (!selectedType || currentKey === "payment" || currentKey === "summary") return null;
  const promo = resolvePromoCode(config.type, config.promoCode);
  const displayPrice = `${(getDisplayPriceCents(config.type, config.promoCode) / 100).toFixed(0)} €`;
  const isFullPayment = PRICES[config.type]?.paymentMode === "full";

  if (gift) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-6 md:px-10 py-3 flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-3 min-w-0">
            <span className="text-xs uppercase tracking-[0.15em] text-muted truncate">{gift.packLabel}</span>
            <span className="text-lg font-medium text-choco shrink-0">SLY Experience</span>
          </div>
          <span className="text-xs text-muted font-light shrink-0">Déjà réglé — <strong className="text-ink font-medium">rien à payer</strong></span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-6 md:px-10 py-3 flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-3 min-w-0">
          <span className="text-xs uppercase tracking-[0.15em] text-muted truncate">{selectedType.label}</span>
          {promo && <span className="text-xs text-muted line-through shrink-0">{selectedType.price}</span>}
          <span className="text-lg font-medium text-ink shrink-0">{displayPrice}</span>
          <span className="hidden sm:inline text-xs text-muted font-light shrink-0">
            {promo ? promo.label : t("included")}
          </span>
        </div>
        {isFullPayment ? (
          <span className="text-xs text-muted font-light shrink-0">{t("fullPaymentPrefix")} <strong className="text-ink font-medium">{t("fullPaymentStrong")}</strong></span>
        ) : (
          <span className="text-xs text-muted font-light shrink-0">{t("depositPrefix")} <strong className="text-ink font-medium">{(DEPOSIT_CENTS / 100).toFixed(0)} €</strong></span>
        )}
      </div>
    </div>
  );
}

/* Contextual reassurance banner — answers the client's fear at the exact step
   where it appears. */
function Reassure({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-8 flex items-start gap-3 px-5 py-4 bg-offwhite text-sm text-ink font-light leading-relaxed max-w-2xl">
      <svg viewBox="0 0 20 20" className="w-4 h-4 mt-0.5 shrink-0 text-choco" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M6.5 10.5 L9 13 L13.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <p>{children}</p>
    </div>
  );
}

/* Generic text-card step — used for the simple single-choice steps that don't
   need a dedicated photo/illustration (buttons, lapel, trouser lining). */
function StepSimpleChoice({
  title, subtitle, options, value, onPick, cols = 3, reassure,
}: {
  title: string;
  subtitle: string;
  options: { id: string; label: string; sub: string; detail: string; photo?: string }[];
  value: string;
  onPick: (id: string) => void;
  cols?: 2 | 3;
  reassure?: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-brand text-3xl md:text-4xl text-ink mb-2">{title}</h2>
      <p className="text-sm text-muted mb-10 font-light">{subtitle}</p>
      <div className={`grid grid-cols-1 ${cols === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"} gap-4`}>
        {options.map((o) => {
          const selected = value === o.id;
          return (
            <button key={o.id} onClick={() => onPick(o.id)}
              className={`text-left border transition-colors flex flex-col overflow-hidden ${selected ? "border-choco bg-choco text-white" : "border-border bg-white hover:border-ink"}`}>
              {o.photo && (
                <div className="relative w-full aspect-square bg-offwhite shrink-0">
                  <Image src={o.photo} alt={o.label} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
                </div>
              )}
              <div className={`p-6 flex flex-col ${!o.photo ? "p-8" : ""}`}>
                <p className={`font-brand text-2xl mb-2 ${selected ? "text-white" : "text-ink"}`}>{o.label}</p>
                <p className={`text-sm mb-3 font-light leading-relaxed ${selected ? "text-white/80" : "text-muted"}`}>{o.sub}</p>
                <p className={`text-xs font-light leading-relaxed ${selected ? "text-white/60" : "text-muted"}`}>{o.detail}</p>
              </div>
            </button>
          );
        })}
      </div>
      {reassure}
    </div>
  );
}

// Same French text used for jacketCut, shirtFit, and the standalone-trousers
// flow's trouserCut step — one shared key. The suit flow's trouserCut step
// is the one exception (shows "Pantalon" instead of "Coupe"), detected below
// by checking whether a "jacket" step is present in the same flow.
const STEP_KEY_TO_LABEL_KEY: Partial<Record<StepKey, string>> = {
  occasion: "occasion", type: "piece", shirtColor: "tissu", contact: "contact",
  shirtFit: "coupe", shirtCollar: "col", shirtCuff: "poignet", shirtMonogram: "monogramme",
  sizing: "mensurations", recap: "recap", summary: "coordonnees", payment: "paiement",
  color: "couleur", jacket: "veste", jacketCut: "coupe", closure: "fermeture",
  jacketButtons: "boutons", lining: "doublure", lapel: "revers", monogram: "monogramme",
  trouserCut: "coupe", waistband: "ceinture", trouserButtons: "boutons", pleats: "plis", hem: "ourlet",
};

function StepBar({ steps, current, maxStepReached, onGoTo }: { steps: StepDef[]; current: number; maxStepReached: number; onGoTo: (i: number) => void }) {
  const t = useTranslations("Configurator");
  const total = steps.length;
  const isSuitFlow = steps.some((s) => s.key === "jacket");
  const currentStepKey = steps[current]?.key;
  const currentLabelKey = currentStepKey === "trouserCut" && isSuitFlow ? "pantalon" : STEP_KEY_TO_LABEL_KEY[currentStepKey ?? "type"];
  const phases = PHASES
    .map((p) => ({ ...p, indices: steps.map((s, i) => (p.keys.includes(s.key) ? i : -1)).filter((i) => i >= 0) }))
    .filter((p) => p.indices.length > 0);

  return (
    <div className="mb-12">
      {/* Current step label — replaces the top-banner labels */}
      <div className="flex items-baseline justify-between mb-4">
        <p className="font-brand text-2xl text-ink">{currentLabelKey ? t(`stepLabels.${currentLabelKey}`) : ""}</p>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">{t("ui.step", { current: current + 1, total })}</p>
      </div>
      <div className="flex items-center gap-2">
        {phases.map((p) => {
          const firstIdx = p.indices[0];
          const lastIdx = p.indices[p.indices.length - 1];
          const isDone = current > lastIdx;
          // Free back-and-forth within anything already reached this
          // session (or restored from a saved draft) — not gated on the
          // phase being fully completed, just on having gotten there once.
          // Jumping further ahead than that stays blocked: a phase never
          // visited has unanswered required fields, and letting StepPayment
          // or the recap render against those would be a real bug, not a
          // convenience.
          const reachable = firstIdx <= maxStepReached;
          return (
            <button
              key={p.id}
              onClick={() => reachable && onGoTo(firstIdx)}
              disabled={!reachable}
              title={t(`phases.${p.id}`)}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                isDone
                  ? "bg-choco cursor-pointer hover:opacity-70"
                  : reachable
                  ? "bg-choco/40 cursor-pointer hover:opacity-70"
                  : "bg-border cursor-not-allowed"
              }`}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-2">
        {phases.map((p) => {
          const firstIdx = p.indices[0];
          const lastIdx = p.indices[p.indices.length - 1];
          const isActive = current >= firstIdx && current <= lastIdx;
          return (
            <span
              key={p.id}
              className={`text-[10px] uppercase tracking-[0.15em] ${isActive ? "text-ink font-medium" : "text-muted"}`}
            >
              {t(`phases.${p.id}`)}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Steps ──────────────────────────────────────────────────── */

function StepType({ config, set }: { config: Config; set: (k: keyof Config, v: string | boolean) => void }) {
  const t = useTranslations("Configurator.type");
  const types = useLocalizedOptions("types", TYPES);
  return (
    <div>
      <h2 className="font-brand text-3xl md:text-4xl text-ink mb-2">{t("title")}</h2>
      <p className="text-sm text-muted mb-10 font-light">{t("subtitle")}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {types.map((ty) => (
          <button key={ty.id} onClick={() => set("type", ty.id)}
            className={`text-left p-8 border transition-colors ${config.type === ty.id ? "border-choco bg-choco text-white" : "border-border bg-white hover:border-ink"}`}>
            <p className={`text-[10px] uppercase tracking-[0.3em] mb-3 ${config.type === ty.id ? "text-white/60" : "text-muted"}`}>{ty.sub}</p>
            <p className={`font-brand text-2xl mb-2 ${config.type === ty.id ? "text-white" : "text-ink"}`}>{ty.label}</p>
            <p className={`text-lg font-medium ${config.type === ty.id ? "text-white" : "text-cherry"}`}>{ty.price}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepJacket({ config, set }: { config: Config; set: (k: keyof Config, v: string | boolean) => void }) {
  const t = useTranslations("Configurator.jacket");
  const jacketStyles = useLocalizedOptions("jacketStyles", JACKET_STYLES);
  return (
    <div>
      <h2 className="font-brand text-3xl md:text-4xl text-ink mb-2">{t("title")}</h2>
      <p className="text-sm text-muted mb-10 font-light">{t("subtitle")}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {jacketStyles.map((j) => {
          const selected = config.jacketStyle === j.id;
          return (
            <button key={j.id} onClick={() => set("jacketStyle", j.id)}
              className={`text-left border transition-colors flex flex-col overflow-hidden ${selected ? "border-choco bg-choco text-white" : "border-border bg-white hover:border-ink"}`}>
              <div className="relative w-full aspect-[3/4] bg-offwhite shrink-0">
                <Image src={j.photo} alt={t("photoAlt", { label: j.label })} fill className="object-cover object-top" sizes="(max-width: 640px) 100vw, 33vw" />
              </div>
              <div className="p-6 flex flex-col">
                <p className={`font-brand text-2xl mb-2 ${selected ? "text-white" : "text-ink"}`}>{j.label}</p>
                <p className={`text-sm mb-3 font-light leading-relaxed h-16 shrink-0 ${selected ? "text-white/80" : "text-muted"}`}>{j.sub}</p>
                <p className={`text-xs font-light leading-relaxed ${selected ? "text-white/60" : "text-muted"}`}>{j.detail}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepJacketCut({ config, set }: { config: Config; set: (k: keyof Config, v: string | boolean) => void }) {
  const t = useTranslations("Configurator.jacketCut");
  const jacketCuts = useLocalizedOptions("jacketCuts", JACKET_CUTS);
  return (
    <StepSimpleChoice
      title={t("title")}
      subtitle={t("subtitle")}
      options={jacketCuts}
      value={config.jacketCut}
      onPick={(id) => set("jacketCut", id)}
      cols={3}
    />
  );
}

function StepClosure({ config, set }: { config: Config; set: (k: keyof Config, v: string | boolean) => void }) {
  const t = useTranslations("Configurator.closure");
  const closures = useLocalizedOptions("closures", CLOSURES);
  return (
    <div>
      <h2 className="font-brand text-3xl md:text-4xl text-ink mb-2">{t("title")}</h2>
      <p className="text-sm text-muted mb-10 font-light">{t("subtitle")}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {closures.map((c) => {
          const selected = config.closure === c.id;
          return (
            <button key={c.id} onClick={() => set("closure", c.id)}
              className={`text-left border transition-colors flex flex-col overflow-hidden ${selected ? "border-choco bg-choco text-white" : "border-border bg-white hover:border-ink"}`}>
              <div className="relative w-full aspect-[3/4] bg-offwhite shrink-0">
                <Image src={c.photo} alt={t("photoAlt", { label: c.label })} fill className="object-cover object-top" sizes="(max-width: 640px) 100vw, 33vw" />
              </div>
              <div className="p-6 flex flex-col">
                <p className={`font-brand text-2xl mb-2 ${selected ? "text-white" : "text-ink"}`}>{c.label}</p>
                <p className={`text-sm mb-3 font-light leading-relaxed ${selected ? "text-white/80" : "text-muted"}`}>{c.sub}</p>
                <p className={`text-xs font-light leading-relaxed ${selected ? "text-white/60" : "text-muted"}`}>{c.detail}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepLining({ config, set }: { config: Config; set: (k: keyof Config, v: string | boolean) => void }) {
  const t = useTranslations("Configurator.lining");
  const linings = useLocalizedOptions("linings", LININGS);
  return (
    <div>
      <h2 className="font-brand text-3xl md:text-4xl text-ink mb-2">{t("title")}</h2>
      <p className="text-sm text-muted mb-10 font-light">{t("subtitle")}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {linings.map((l) => {
          const selected = config.lining === l.id;
          return (
            <button key={l.id} onClick={() => set("lining", l.id)}
              className={`text-left border transition-colors flex flex-col overflow-hidden ${selected ? "border-choco bg-choco text-white" : "border-border bg-white hover:border-ink"}`}>
              <div className="relative w-full aspect-[16/10] bg-offwhite shrink-0">
                <Image src={l.photo} alt={l.label} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
              </div>
              <div className="p-6 flex flex-col">
                <p className={`font-brand text-2xl mb-2 ${selected ? "text-white" : "text-ink"}`}>{l.label}</p>
                <p className={`text-sm font-medium mb-2 h-10 shrink-0 ${selected ? "text-white/80" : "text-muted"}`}>{l.sub}</p>
                <p className={`text-xs font-light leading-relaxed ${selected ? "text-white/60" : "text-muted"}`}>{l.detail}</p>
              </div>
            </button>
          );
        })}
      </div>

      <Reassure>
        <strong className="font-medium">{t("reassureStrong")}</strong> {t("reassureRest")}
      </Reassure>
    </div>
  );
}

function StepColor({ config, setConfig }: { config: Config; setConfig: React.Dispatch<React.SetStateAction<Config>> }) {
  const t = useTranslations("Configurator.color");
  const colorFamilies = useLocalizedColorFamilies();
  const patterns = useLocalizedOptions("patterns", PATTERNS);
  const selectedFamily = colorFamilies.find((f) => f.id === config.colorFamily);
  const isCustom = config.colorType === "custom";

  function pickFamily(familyId: string) {
    setConfig((prev) => ({ ...prev, colorFamily: familyId, color: "", colorType: "", pattern: "" }));
  }
  function pickShade(shadeId: string) {
    setConfig((prev) => ({ ...prev, color: shadeId }));
  }
  function pickColorType(type: "solid" | "pattern") {
    setConfig((prev) => ({ ...prev, colorType: type, pattern: type === "solid" ? "" : prev.pattern }));
  }
  function pickPattern(patternId: string) {
    setConfig((prev) => ({ ...prev, pattern: patternId }));
  }
  function pickCustom() {
    setConfig((prev) => ({ ...prev, colorFamily: "", color: "", pattern: "", colorType: "custom" }));
  }

  return (
    <div>
      <h2 className="font-brand text-3xl md:text-4xl text-ink mb-2">{t("title")}</h2>
      <p className="text-sm text-muted mb-10 font-light">{t("subtitle")}</p>

      {/* Family */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {colorFamilies.map((f) => (
          <button key={f.id} onClick={() => pickFamily(f.id)}
            className={`text-left p-5 border transition-colors ${!isCustom && config.colorFamily === f.id ? "border-choco" : "border-border hover:border-ink"}`}>
            <div className="w-full aspect-square mb-4 rounded-sm" style={{ background: f.hex }} />
            <div className="flex items-center gap-2">
              <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${!isCustom && config.colorFamily === f.id ? "border-choco" : "border-border"}`}>
                {!isCustom && config.colorFamily === f.id && <div className="w-2 h-2 rounded-full bg-choco" />}
              </div>
              <p className="text-sm text-ink font-medium">{f.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Shade, once a family is picked */}
      {!isCustom && selectedFamily && (
        <div className="mt-10">
          <label className="text-[11px] uppercase tracking-[0.2em] text-muted mb-3 block">{t("shadeLabel", { family: selectedFamily.label.toLowerCase() })}</label>
          <div className="grid grid-cols-3 gap-4">
            {selectedFamily.shades.map((s) => (
              <button key={s.id} onClick={() => pickShade(s.id)}
                className={`text-left p-4 border transition-colors ${config.color === s.id ? "border-choco" : "border-border hover:border-ink"}`}>
                <div
                  className="w-full aspect-square mb-3 rounded-sm bg-cover bg-center"
                  style={s.texture ? { backgroundImage: `url(${s.texture})` } : { background: s.hex }}
                />
                <p className="text-xs text-ink font-medium">
                  {s.label}
                  {s.texture && <span className="ml-1.5 text-[10px] text-muted font-normal align-middle">{t("textureTag")}</span>}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Solid vs Pattern, once a shade is picked */}
      {!isCustom && selectedFamily && config.color && (
        <div className="mt-10">
          <label className="text-[11px] uppercase tracking-[0.2em] text-muted mb-3 block">{t("finishLabel")}</label>
          <div className="flex gap-4">
            {([{ id: "solid", label: t("solid") }, { id: "pattern", label: t("pattern") }] as const).map((opt) => (
              <button key={opt.id} onClick={() => pickColorType(opt.id)}
                className={`flex-1 py-4 px-6 border text-sm transition-colors ${config.colorType === opt.id ? "border-choco bg-choco text-white" : "border-border bg-white hover:border-ink text-ink"}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pattern type, once "À motifs" is chosen */}
      {!isCustom && config.colorType === "pattern" && (
        <div className="flex flex-col gap-4 mt-6">
          {patterns.map((p) => (
            <button key={p.id} onClick={() => pickPattern(p.id)}
              className={`text-left p-7 border transition-colors ${config.pattern === p.id ? "border-choco bg-choco text-white" : "border-border bg-white hover:border-ink"}`}>
              <p className={`font-brand text-2xl mb-1 ${config.pattern === p.id ? "text-white" : "text-ink"}`}>{p.label}</p>
              <p className={`text-sm font-medium mb-2 ${config.pattern === p.id ? "text-white/80" : "text-muted"}`}>{p.sub}</p>
              <p className={`text-sm font-light leading-relaxed ${config.pattern === p.id ? "text-white/70" : "text-muted"}`}>{p.detail}</p>
            </button>
          ))}
        </div>
      )}

      {/* Free choice — nothing preset fits */}
      <button onClick={pickCustom}
        className={`w-full text-left mt-10 px-6 py-5 border transition-colors ${isCustom ? "border-choco bg-choco text-white" : "border-border border-dashed bg-white hover:border-ink"}`}>
        <p className={`text-sm font-medium mb-1 ${isCustom ? "text-white" : "text-ink"}`}>
          {isCustom ? t("customCtaActive") : t("customCta")}
        </p>
        <p className={`text-xs font-light ${isCustom ? "text-white/70" : "text-muted"}`}>
          {t("customDesc")}
        </p>
      </button>

      <Reassure>
        <strong className="font-medium">{t("reassureStrong")}</strong> {t("reassureRest")}
      </Reassure>
    </div>
  );
}

// Deliberately early in the flow (right after piece + color, before any of
// the granular style choices) rather than at the very end — see the
// "contact" case in validation.ts. This is what lets Luc see an abandoned
// configuration at all: the lead-capture call fires the moment this step is
// completed, well before the client would otherwise reach payment.
// Flat swatch grid, not the suit's family→shade→solid/pattern cascade — no
// real shirt-fabric photos exist yet, and a 135€ shirt doesn't warrant the
// same depth of choice as a 645€ suit. See SHIRT_FABRICS in data.ts.
function StepShirtColor({ config, set }: { config: Config; set: (k: keyof Config, v: string | boolean) => void }) {
  const t = useTranslations("Configurator.shirtColor");
  const shirtFabrics = useLocalizedOptions("shirtFabrics", SHIRT_FABRICS);
  const isCustom = config.shirtFabric === "custom";
  return (
    <div>
      <h2 className="font-brand text-3xl md:text-4xl text-ink mb-2">{t("title")}</h2>
      <p className="text-sm text-muted mb-10 font-light">{t("subtitle")}</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {shirtFabrics.map((f) => (
          <button key={f.id} onClick={() => set("shirtFabric", f.id)}
            className={`text-left p-4 border transition-colors ${!isCustom && config.shirtFabric === f.id ? "border-choco" : "border-border hover:border-ink"}`}>
            <div className="w-full aspect-square mb-3 rounded-sm border border-border/50" style={{ background: f.hex }} />
            <p className="text-xs text-ink font-medium mb-1">{f.label}</p>
            <p className="text-[11px] text-muted font-light">{f.sub}</p>
          </button>
        ))}
      </div>

      <button onClick={() => set("shirtFabric", "custom")}
        className={`w-full text-left mt-6 px-6 py-5 border transition-colors ${isCustom ? "border-choco bg-choco text-white" : "border-border border-dashed bg-white hover:border-ink"}`}>
        <p className={`text-sm font-medium mb-1 ${isCustom ? "text-white" : "text-ink"}`}>
          {isCustom ? t("customCtaActive") : t("customCta")}
        </p>
        <p className={`text-xs font-light ${isCustom ? "text-white/70" : "text-muted"}`}>
          {t("customDesc")}
        </p>
      </button>

      <Reassure>
        <strong className="font-medium">{t("reassureStrong")}</strong> {t("reassureRest")}
      </Reassure>
    </div>
  );
}

function StepContact({ config, set }: { config: Config; set: (k: keyof Config, v: string | boolean) => void }) {
  const t = useTranslations("Configurator.contact");
  return (
    <div className="max-w-md">
      <h2 className="font-brand text-3xl md:text-4xl text-ink mb-2">{t("title")}</h2>
      <p className="text-sm text-muted mb-10 font-light">
        {t("subtitle")}
      </p>
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2 block">{t("firstName")}</label>
            <input id="firstName" required value={config.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder={t("firstNamePlaceholder")}
              className="w-full border border-border px-4 py-3 text-sm text-ink placeholder:text-muted/40 outline-none focus:border-choco transition-colors bg-white"/>
          </div>
          <div>
            <label htmlFor="lastName" className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2 block">{t("lastName")}</label>
            <input id="lastName" required value={config.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder={t("lastNamePlaceholder")}
              className="w-full border border-border px-4 py-3 text-sm text-ink placeholder:text-muted/40 outline-none focus:border-choco transition-colors bg-white"/>
          </div>
        </div>
        <div>
          <label htmlFor="email" className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2 block">{t("email")}</label>
          <input id="email" required type="email" value={config.email} onChange={(e) => set("email", e.target.value)} placeholder={t("emailPlaceholder")}
            className="w-full border border-border px-4 py-3 text-sm text-ink placeholder:text-muted/40 outline-none focus:border-choco transition-colors bg-white"/>
        </div>
      </div>
    </div>
  );
}

function StepTrouserCut({ config, set }: { config: Config; set: (k: keyof Config, v: string | boolean) => void }) {
  const t = useTranslations("Configurator.trouserCut");
  const jacketCuts = useLocalizedOptions("jacketCuts", JACKET_CUTS);
  const trouserCuts = useLocalizedOptions("trouserCuts", TROUSER_CUTS);
  // Only the "suit" flow has a jacket cut chosen beforehand — the standalone
  // "trousers" flow has no veste, so no recommendation applies there.
  const jacketCutLabel = jacketCuts.find((j) => j.id === config.jacketCut)?.label;
  const hasJacketContext = !!config.jacketCut;
  const recommendedTrouserId = hasJacketContext ? JACKET_CUT_TO_TROUSER_CUT[config.jacketCut] : undefined;

  return (
    <div>
      <h2 className="font-brand text-3xl md:text-4xl text-ink mb-2">{t("title")}</h2>
      <p className="text-sm text-muted mb-4 font-light">
        {hasJacketContext ? t("subtitleWithJacket") : t("subtitleNoJacket")}
      </p>
      {hasJacketContext && jacketCutLabel && (
        <p className="text-sm text-choco mb-10 font-light">
          {t("recommendationPrefix")} <strong className="font-medium">{jacketCutLabel}</strong>{t("recommendationSuffix")}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {trouserCuts.map((ty) => {
          const isRecommended = hasJacketContext && ty.id === recommendedTrouserId;
          const selected = config.trouserCut === ty.id;
          return (
            <button key={ty.id} onClick={() => set("trouserCut", ty.id)}
              className={`relative text-left border transition-colors flex flex-col overflow-hidden ${selected ? "border-choco bg-choco text-white" : "border-border bg-white hover:border-ink"}`}>
              {isRecommended && (
                <span className={`absolute top-4 right-4 z-10 text-[9px] uppercase tracking-[0.2em] px-2 py-1 rounded-sm ${selected ? "bg-white/20 text-white" : "bg-choco text-white"}`}>
                  <RecommendedLabel />
                </span>
              )}
              <div className="relative w-full aspect-[5/9] bg-offwhite shrink-0">
                <Image src={ty.photo} alt={t("photoAlt", { label: ty.label })} fill className="object-cover object-top" sizes="(max-width: 640px) 100vw, 33vw" />
              </div>
              <div className="p-6 flex flex-col">
                <p className={`font-brand text-2xl mb-2 ${selected ? "text-white" : "text-ink"}`}>{ty.label}</p>
                <p className={`text-sm mb-3 font-light leading-relaxed h-10 shrink-0 ${selected ? "text-white/80" : "text-muted"}`}>{ty.sub}</p>
                <p className={`text-xs font-light leading-relaxed ${selected ? "text-white/60" : "text-muted"}`}>{ty.detail}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RecommendedLabel() {
  const t = useTranslations("Configurator.ui");
  return <>{t("recommended")}</>;
}

function StepLapel({ config, set }: { config: Config; set: (k: keyof Config, v: string | boolean) => void }) {
  const t = useTranslations("Configurator.lapel");
  const lapels = useLocalizedOptions("lapels", LAPELS);
  const lapelWidths = useLocalizedOptions("lapelWidths", LAPEL_WIDTHS);
  return (
    <div>
      <h2 className="font-brand text-3xl md:text-4xl text-ink mb-2">{t("title")}</h2>
      <p className="text-sm text-muted mb-10 font-light">{t("subtitle")}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {lapels.map((l) => {
          const selected = config.lapel === l.id;
          return (
            <button key={l.id} onClick={() => set("lapel", l.id)}
              className={`text-left border transition-colors flex flex-col overflow-hidden ${selected ? "border-choco bg-choco text-white" : "border-border bg-white hover:border-ink"}`}>
              <div className="relative w-full aspect-[3/4] bg-offwhite shrink-0">
                <Image src={l.photo} alt={t("photoAlt", { label: l.label, width: l.widthLabel })} fill className="object-cover object-top" sizes="(max-width: 640px) 100vw, 50vw" />
                <span className="absolute bottom-3 left-3 z-10 text-[9px] uppercase tracking-[0.2em] px-2 py-1 rounded-sm bg-ink/80 text-white">
                  {l.widthLabel}
                </span>
              </div>
              <div className="p-6 flex flex-col">
                <p className={`font-brand text-2xl mb-2 ${selected ? "text-white" : "text-ink"}`}>{l.label}</p>
                <p className={`text-sm mb-3 font-light leading-relaxed ${selected ? "text-white/80" : "text-muted"}`}>{l.sub}</p>
                <p className={`text-xs font-light leading-relaxed ${selected ? "text-white/60" : "text-muted"}`}>{l.detail}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-10">
        <label className="text-[11px] uppercase tracking-[0.2em] text-muted mb-3 block">{t("widthLabel")}</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {lapelWidths.map((w) => {
            const selected = config.lapelWidth === w.id;
            return (
              <button key={w.id} onClick={() => set("lapelWidth", w.id)}
                className={`text-left p-6 border transition-colors flex flex-col ${selected ? "border-choco bg-choco text-white" : "border-border bg-white hover:border-ink"}`}>
                <p className={`font-brand text-2xl mb-2 ${selected ? "text-white" : "text-ink"}`}>{w.label}</p>
                <p className={`text-xs font-light leading-relaxed ${selected ? "text-white/80" : "text-muted"}`}>{w.sub}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StepTrouserButtons({ config, set }: { config: Config; set: (k: keyof Config, v: string | boolean) => void }) {
  const t = useTranslations("Configurator.trouserButtons");
  const buttonMaterials = useLocalizedOptions("buttonMaterials", BUTTON_MATERIALS);
  // The actual auto-sync (default trouser buttons to match the jacket, and
  // re-sync on a later jacket-buttons change unless deliberately overridden)
  // lives in the parent Customize() component — this step remounts every
  // time the client navigates to/from it, which would otherwise reset any
  // local tracking of "was this auto-applied" right when it's needed most.
  const hasJacketContext = !!config.jacketButtons;

  return (
    <div>
      <h2 className="font-brand text-3xl md:text-4xl text-ink mb-2">{t("title")}</h2>
      <p className="text-sm text-muted mb-10 font-light">{t("subtitle")}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {buttonMaterials.map((b) => {
          const selected = config.trouserButtons === b.id;
          const isRecommended = hasJacketContext && b.id === config.jacketButtons;
          return (
            <button key={b.id} onClick={() => set("trouserButtons", b.id)}
              className={`relative text-left border transition-colors flex flex-col overflow-hidden ${selected ? "border-choco bg-choco text-white" : "border-border bg-white hover:border-ink"}`}>
              {isRecommended && (
                <span className={`absolute top-4 right-4 z-10 text-[9px] uppercase tracking-[0.2em] px-2 py-1 rounded-sm ${selected ? "bg-white/20 text-white" : "bg-choco text-white"}`}>
                  <RecommendedLabel />
                </span>
              )}
              <div className="relative w-full aspect-square bg-offwhite shrink-0">
                <Image src={b.photo} alt={b.label} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
              </div>
              <div className="p-6 flex flex-col">
                <p className={`font-brand text-2xl mb-2 ${selected ? "text-white" : "text-ink"}`}>{b.label}</p>
                <p className={`text-sm mb-3 font-light leading-relaxed ${selected ? "text-white/80" : "text-muted"}`}>{b.sub}</p>
                <p className={`text-xs font-light leading-relaxed ${selected ? "text-white/60" : "text-muted"}`}>{b.detail}</p>
              </div>
            </button>
          );
        })}
      </div>
      {hasJacketContext && (
        <p className="text-sm text-choco mt-6 font-light">
          {t("autoSyncNote")}
        </p>
      )}
    </div>
  );
}

function StepWaistband({ config, set }: { config: Config; set: (k: keyof Config, v: string | boolean) => void }) {
  const t = useTranslations("Configurator.waistband");
  const waistbands = useLocalizedOptions("waistbands", WAISTBANDS);
  return (
    <div>
      <h2 className="font-brand text-3xl md:text-4xl text-ink mb-2">{t("title")}</h2>
      <p className="text-sm text-muted mb-10 font-light">{t("subtitle")}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {waistbands.map((w) => {
          const selected = config.waistband === w.id;
          return (
            <button key={w.id} onClick={() => set("waistband", w.id)}
              className={`text-left border transition-colors flex flex-col overflow-hidden ${selected ? "border-choco bg-choco text-white" : "border-border bg-white hover:border-ink"}`}>
              <div className="relative w-full h-64 md:h-72 bg-offwhite shrink-0">
                <Image src={w.photo} alt={t("photoAlt", { label: w.label })} fill className="object-cover object-[center_22%]" sizes="(max-width: 640px) 100vw, 50vw" />
                <span className="absolute bottom-3 left-3 z-10 text-[9px] uppercase tracking-[0.2em] px-2 py-1 rounded-sm bg-ink/80 text-white">
                  {w.widthLabel}
                </span>
              </div>
              <div className="p-6 flex flex-col">
                <p className={`font-brand text-2xl mb-2 ${selected ? "text-white" : "text-ink"}`}>{w.label}</p>
                <p className={`text-sm mb-3 font-light leading-relaxed ${selected ? "text-white/80" : "text-muted"}`}>{w.sub}</p>
                <p className={`text-xs font-light leading-relaxed ${selected ? "text-white/60" : "text-muted"}`}>{w.detail}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-10">
        <label className="text-[11px] uppercase tracking-[0.2em] text-muted mb-3 block">{t("widthLabel")}</label>
        <div className="grid grid-cols-3 gap-2 max-w-sm">
          {WAISTBAND_WIDTHS.map((w) => (
            <button key={w} onClick={() => set("waistbandWidth", w)}
              className={`py-3 text-sm border transition-colors ${config.waistbandWidth === w ? "border-choco bg-choco text-white" : "border-border hover:border-ink text-ink"}`}>
              {w}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepPleats({ config, set }: { config: Config; set: (k: keyof Config, v: string | boolean) => void }) {
  const t = useTranslations("Configurator.pleats");
  const pleats = useLocalizedOptions("pleats", PLEATS);
  return (
    <div>
      <h2 className="font-brand text-3xl md:text-4xl text-ink mb-2">{t("title")}</h2>
      <p className="text-sm text-muted mb-10 font-light">{t("subtitle")}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {pleats.map((p) => {
          const selected = config.pleats === p.id;
          return (
            <button key={p.id} onClick={() => set("pleats", p.id)}
              className={`text-left border transition-colors flex flex-col overflow-hidden ${selected ? "border-choco bg-choco text-white" : "border-border bg-white hover:border-ink"}`}>
              <div className="relative w-full aspect-[5/9] bg-offwhite shrink-0">
                <Image src={p.photo} alt={t("photoAlt", { label: p.label })} fill className="object-cover object-top" sizes="(max-width: 640px) 100vw, 33vw" />
              </div>
              <div className="p-6 flex flex-col">
                <p className={`font-brand text-2xl mb-2 ${selected ? "text-white" : "text-ink"}`}>{p.label}</p>
                <p className={`text-sm mb-3 font-light leading-relaxed h-10 shrink-0 ${selected ? "text-white/80" : "text-muted"}`}>{p.sub}</p>
                <p className={`text-xs font-light leading-relaxed ${selected ? "text-white/60" : "text-muted"}`}>{p.detail}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepHem({ config, set }: { config: Config; set: (k: keyof Config, v: string | boolean) => void }) {
  const t = useTranslations("Configurator.hem");
  const hems = useLocalizedOptions("hems", HEMS);
  return (
    <div>
      <h2 className="font-brand text-3xl md:text-4xl text-ink mb-2">{t("title")}</h2>
      <p className="text-sm text-muted mb-10 font-light">{t("subtitle")}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {hems.map((h) => {
          const selected = config.hem === h.id;
          return (
            <button key={h.id} onClick={() => set("hem", h.id)}
              className={`text-left border transition-colors flex flex-col overflow-hidden ${selected ? "border-choco bg-choco text-white" : "border-border bg-white hover:border-ink"}`}>
              <div className="relative w-full aspect-[3/4] bg-offwhite shrink-0">
                <Image src={h.photo} alt={t("photoAlt", { label: h.label })} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
              </div>
              <div className="p-6 flex flex-col">
                <p className={`font-brand text-2xl mb-2 ${selected ? "text-white" : "text-ink"}`}>{h.label}</p>
                <p className={`text-sm mb-3 font-light leading-relaxed ${selected ? "text-white/80" : "text-muted"}`}>{h.sub}</p>
                <p className={`text-xs font-light leading-relaxed ${selected ? "text-white/60" : "text-muted"}`}>{h.detail}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepSizing({ config, set }: { config: Config; set: (k: keyof Config, v: string | boolean) => void }) {
  const t = useTranslations("Configurator.sizing");
  const sizes = ["44", "46", "48", "50", "52", "54", "56+"];
  const isShirt = config.type === "shirt";
  return (
    <div className="max-w-xl">
      <h2 className="font-brand text-3xl md:text-4xl text-ink mb-2">{t("title")}</h2>
      <p className="text-sm text-muted mb-10 font-light">{t("subtitle")}</p>

      <div className="flex flex-col gap-8">
        {isShirt ? (
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label htmlFor="neckSize" className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2 block">{t("neckSize")}</label>
              <div className="relative">
                <input id="neckSize" required type="number" min="28" max="55" value={config.neckSize} onChange={(e) => set("neckSize", e.target.value)}
                  placeholder="40"
                  className="w-full border border-border px-4 py-3 text-sm text-ink placeholder:text-muted/40 outline-none focus:border-choco transition-colors bg-white pr-12"/>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">cm</span>
              </div>
            </div>
            <div>
              <label htmlFor="sleeveLength" className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2 block">{t("sleeveLength")}</label>
              <div className="relative">
                <input id="sleeveLength" required type="number" min="50" max="80" value={config.sleeveLength} onChange={(e) => set("sleeveLength", e.target.value)}
                  placeholder="64"
                  className="w-full border border-border px-4 py-3 text-sm text-ink placeholder:text-muted/40 outline-none focus:border-choco transition-colors bg-white pr-12"/>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">cm</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label htmlFor="height" className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2 block">{t("height")}</label>
              <div className="relative">
                <input id="height" required type="number" min="140" max="220" value={config.height} onChange={(e) => set("height", e.target.value)}
                  placeholder="180"
                  className="w-full border border-border px-4 py-3 text-sm text-ink placeholder:text-muted/40 outline-none focus:border-choco transition-colors bg-white pr-12"/>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">cm</span>
              </div>
            </div>
            <div>
              <label htmlFor="weight" className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2 block">{t("weight")}</label>
              <div className="relative">
                <input id="weight" required type="number" min="40" max="200" value={config.weight} onChange={(e) => set("weight", e.target.value)}
                  placeholder="75"
                  className="w-full border border-border px-4 py-3 text-sm text-ink placeholder:text-muted/40 outline-none focus:border-choco transition-colors bg-white pr-12"/>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">kg</span>
              </div>
            </div>
          </div>
        )}

        {!isShirt && config.type !== "trousers" && (
          <div>
            <label className="text-[11px] uppercase tracking-[0.2em] text-muted mb-3 block">{t("jacketSizeLabel")}</label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {sizes.map((s) => (
                <button key={s} onClick={() => set("jacketSize", s)}
                  className={`py-3 text-sm border transition-colors ${config.jacketSize === s ? "border-choco bg-choco text-white" : "border-border hover:border-ink text-ink"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {!isShirt && config.type !== "blazer" && (
          <div>
            <label className="text-[11px] uppercase tracking-[0.2em] text-muted mb-3 block">{t("waistSizeLabel")}</label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {WAIST_SIZES.map((s) => (
                <button key={s} onClick={() => set("waistSize", s)}
                  className={`py-3 text-sm border transition-colors ${config.waistSize === s ? "border-choco bg-choco text-white" : "border-border hover:border-ink text-ink"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="text-[11px] uppercase tracking-[0.2em] text-muted mb-3 block">{t("tapeMeasureQuestion")}</label>
          <div className="flex gap-4 mb-4">
            {[{ v: "yes", label: t("tapeYes") }, { v: "no", label: t("tapeNo") }].map(({ v, label }) => (
              <button key={v} onClick={() => set("hasTapeMeasure", v)}
                className={`flex-1 py-4 px-5 border text-sm transition-colors ${config.hasTapeMeasure === v ? "border-choco bg-choco text-white" : "border-border bg-white hover:border-ink text-ink"}`}>
                {label}
              </button>
            ))}
          </div>
          {config.hasTapeMeasure === "no" && (
            <div className="flex flex-col gap-4 mt-2">
              <p className="text-xs text-muted font-light">{t("tapeShipNote")}</p>
              <div>
                <label htmlFor="shippingAddress" className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2 block">{t("address")}</label>
                <input id="shippingAddress" value={config.shippingAddress} onChange={(e) => set("shippingAddress", e.target.value)} placeholder={t("addressPlaceholder")}
                  className="w-full border border-border px-4 py-3 text-sm text-ink placeholder:text-muted/40 outline-none focus:border-choco transition-colors bg-white"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="shippingCity" className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2 block">{t("city")}</label>
                  <input id="shippingCity" value={config.shippingCity} onChange={(e) => set("shippingCity", e.target.value)} placeholder={t("cityPlaceholder")}
                    className="w-full border border-border px-4 py-3 text-sm text-ink placeholder:text-muted/40 outline-none focus:border-choco transition-colors bg-white"/>
                </div>
                <div>
                  <label htmlFor="shippingZip" className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2 block">{t("zip")}</label>
                  <input id="shippingZip" value={config.shippingZip} onChange={(e) => set("shippingZip", e.target.value)} placeholder={t("zipPlaceholder")}
                    className="w-full border border-border px-4 py-3 text-sm text-ink placeholder:text-muted/40 outline-none focus:border-choco transition-colors bg-white"/>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-muted font-light">{t("confidentialNote")}</p>

        <Reassure>
          <strong className="font-medium">{t("reassureStrong")}</strong> {t("reassureRest")}
        </Reassure>
      </div>
    </div>
  );
}

function StepSummary({ config, set, onSubmit }: { config: Config; set: (k: keyof Config, v: string | boolean) => void; onSubmit: () => void }) {
  const t = useTranslations("Configurator");
  const tSummary = useTranslations("Configurator.summary");
  const types = useLocalizedOptions("types", TYPES);
  const summaryRows = buildSummaryRows(config, t);
  const promo = resolvePromoCode(config.type, config.promoCode);
  const promoEnteredButInvalid = config.promoCode.trim() !== "" && !promo;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div>
        <h2 className="font-brand text-3xl md:text-4xl text-ink mb-8">{tSummary("title")}</h2>
        <div className="border border-border divide-y divide-border mb-8">
          {summaryRows.map(([label, value]) => (
            <div key={label} className="flex justify-between px-6 py-4">
              <span className="text-sm text-muted font-light">{label}</span>
              <span className="text-sm text-ink font-medium">{value}</span>
            </div>
          ))}
        </div>
        <div className="bg-offwhite p-5 text-sm text-muted font-light leading-relaxed">
          <strong className="text-ink font-medium">{tSummary("nextStepStrong")}</strong> {tSummary("nextStepRest")}
        </div>
      </div>
      <div>
        <h2 className="font-brand text-3xl md:text-4xl text-ink mb-8">{tSummary("detailsTitle")}</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="flex flex-col gap-5">
          <div>
            <label htmlFor="message" className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2 block">{tSummary("message")}</label>
            <textarea id="message" rows={3} value={config.message} onChange={(e) => set("message", e.target.value)} placeholder={tSummary("messagePlaceholder")}
              className="w-full border border-border px-4 py-3 text-sm text-ink placeholder:text-muted/40 outline-none focus:border-choco transition-colors bg-white resize-none"/>
          </div>
          <div>
            <label htmlFor="referredBy" className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2 block">{tSummary("referredBy")}</label>
            <input id="referredBy" value={config.referredBy} onChange={(e) => set("referredBy", e.target.value)} placeholder={tSummary("referredByPlaceholder")}
              className="w-full border border-border px-4 py-3 text-sm text-ink placeholder:text-muted/40 outline-none focus:border-choco transition-colors bg-white"/>
          </div>
          <div>
            <label htmlFor="promoCode" className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2 block">{tSummary("promoCode")}</label>
            <input id="promoCode" value={config.promoCode} onChange={(e) => set("promoCode", e.target.value)} placeholder={tSummary("promoCodePlaceholder")}
              className={`w-full border px-4 py-3 text-sm text-ink placeholder:text-muted/40 outline-none transition-colors bg-white uppercase ${
                promo ? "border-choco" : promoEnteredButInvalid ? "border-red-300" : "border-border focus:border-choco"
              }`}/>
            {promo && (
              <p className="text-xs text-choco mt-2">
                {tSummary("promoApplied", {
                  label: promo.label,
                  price: `${(promo.priceCents / 100).toFixed(0)} €`,
                  originalPrice: types.find((ty) => ty.id === config.type)?.price ?? "",
                })}
              </p>
            )}
            {promoEnteredButInvalid && (
              <p className="text-xs text-muted mt-2">{tSummary("promoInvalid")}</p>
            )}
          </div>
          <button type="submit" className="mt-2 px-8 py-4 bg-choco text-white text-sm tracking-wide hover:bg-ink transition-colors">
            {tSummary("submitCta")}
          </button>
        </form>
      </div>
    </div>
  );
}

function StepMonogram({
  config, set, setConfig, placements, subtitle,
}: {
  config: Config; set: (k: keyof Config, v: string | boolean) => void; setConfig: React.Dispatch<React.SetStateAction<Config>>;
  placements?: { id: string; label: string; sub: string }[]; subtitle?: string;
}) {
  const t = useTranslations("Configurator.monogram");
  const localizedJacketPlacements = useLocalizedOptions("monogramPlacements", MONOGRAM_PLACEMENTS);
  const localizedShirtPlacements = useLocalizedOptions("shirtMonogramPlacements", SHIRT_MONOGRAM_PLACEMENTS);
  const monogramColors = useLocalizedMonogramColors(MONOGRAM_COLORS);
  const resolvedPlacements = placements
    ? (placements === SHIRT_MONOGRAM_PLACEMENTS ? localizedShirtPlacements : localizedJacketPlacements)
    : localizedJacketPlacements;
  const resolvedSubtitle = subtitle ?? t("jacketSubtitle");

  return (
    <div>
      <h2 className="font-brand text-3xl md:text-4xl text-ink mb-2">{t("title")}</h2>
      <p className="text-sm text-muted mb-10 font-light">{resolvedSubtitle}</p>

      {/* Toggle */}
      <div className="flex gap-4 mb-10">
        {[{ v: true, label: t("yes") }, { v: false, label: t("no") }].map(({ v, label }) => (
          <button key={String(v)} onClick={() => setConfig(c => ({ ...c, monogram: v }))}
            className={`flex-1 py-4 px-6 border text-sm transition-colors ${config.monogram === v ? "border-choco bg-choco text-white" : "border-border bg-white hover:border-ink text-ink"}`}>
            {label}
          </button>
        ))}
      </div>

      {config.monogram && (
        <div className="flex flex-col gap-10">
          {/* Placement */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted mb-4">{t("placement")}</p>
            <div className="flex flex-col gap-3">
              {resolvedPlacements.map((p) => (
                <button key={p.id} onClick={() => set("monogramPlacement", p.id)}
                  className={`text-left px-6 py-5 border flex items-center gap-5 transition-colors ${config.monogramPlacement === p.id ? "border-choco bg-choco text-white" : "border-border bg-white hover:border-ink"}`}>
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${config.monogramPlacement === p.id ? "border-white" : "border-border"}`}>
                    {config.monogramPlacement === p.id && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className={`font-medium text-sm mb-0.5 ${config.monogramPlacement === p.id ? "text-white" : "text-ink"}`}>{p.label}</p>
                    <p className={`text-xs font-light ${config.monogramPlacement === p.id ? "text-white/70" : "text-muted"}`}>{p.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Initials */}
          <div>
            <label htmlFor="monogramInitials" className="text-[11px] uppercase tracking-[0.2em] text-muted mb-4 block">{t("initials")} <span className="text-border normal-case tracking-normal">{t("initialsMax")}</span></label>
            <input
              id="monogramInitials"
              type="text" maxLength={15} value={config.monogramInitials}
              onChange={(e) => set("monogramInitials", e.target.value)}
              placeholder={t("initialsPlaceholder")}
              className="w-full border border-border px-5 py-4 text-base text-ink placeholder:text-muted/40 outline-none focus:border-choco transition-colors bg-white font-brand tracking-widest"
            />
            <p className="text-xs text-muted mt-2 font-light">{config.monogramInitials.length}/15</p>
          </div>

          {/* Color */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted mb-4">{t("color")}</p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {monogramColors.map((c) => (
                <button key={c.id} onClick={() => set("monogramColor", c.id)}
                  className={`flex flex-col items-center gap-2 group`}>
                  <div className={`w-10 h-10 rounded-full border-2 transition-all ${config.monogramColor === c.id ? "border-choco scale-110" : "border-transparent hover:border-border"}`}
                    style={{ background: c.hex }} />
                  <span className={`text-[10px] tracking-wide ${config.monogramColor === c.id ? "text-ink font-medium" : "text-muted"}`}>{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StepTransition({ config }: { config: Config }) {
  const t = useTranslations("Configurator.transition");
  const types = useLocalizedOptions("types", TYPES);
  const selectedType = types.find((ty) => ty.id === config.type);
  return (
    <div className="max-w-2xl">
      <p className="text-[11px] uppercase tracking-[0.3em] text-cherry font-medium mb-6">{t("eyebrow")}</p>
      <h2 className="font-brand text-4xl md:text-5xl text-ink leading-tight mb-8">
        {t("titlePrefix")}<br />{t("titleSuffix", { piece: (selectedType?.label ?? t("titleFallback")).toLowerCase() })}
      </h2>
      <div className="flex flex-col gap-5 text-base text-muted font-light leading-relaxed mb-10">
        <p className="italic">
          {t("quote")}
        </p>
        <p>
          {t("paragraph2Prefix")} <strong className="text-ink font-medium">{t("paragraph2Fabric")}</strong> {t("paragraph2Mid")} <strong className="text-ink font-medium">{t("paragraph2Buttons")}</strong>{t("paragraph2Suffix")}
        </p>
        <p>
          {t("paragraph3Prefix")} <strong className="text-ink font-medium">{t("paragraph3Strong")}</strong>{" "}
          {t("paragraph3Suffix")}
        </p>
      </div>
      <div className="border-l-2 border-choco pl-6 py-1 mb-8">
        <p className="text-sm text-ink font-medium mb-1">{t("expectTitle")}</p>
        <ul className="text-sm text-muted font-light space-y-1">
          <li>• {t("expect1")}</li>
          <li>• {t("expect2")}</li>
          <li>• {t("expect3")}</li>
          <li>• {t("expect4")}</li>
        </ul>
      </div>
      <Link
        href="/notre-histoire"
        className="inline-flex items-center gap-2 text-sm tracking-wide text-muted border-b border-border pb-1 hover:text-choco hover:border-choco transition-colors"
      >
        {t("storyLink")}
        <span>→</span>
      </Link>
    </div>
  );
}

function StepPayment({ config, gift }: { config: Config; gift: GiftState }) {
  const t = useTranslations("Configurator.payment");
  const tConfigurator = useTranslations("Configurator");
  const types = useLocalizedOptions("types", TYPES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedType = types.find((ty) => ty.id === config.type);
  const promo = resolvePromoCode(config.type, config.promoCode);
  const displayPrice = `${(getDisplayPriceCents(config.type, config.promoCode) / 100).toFixed(0)} €`;
  const isFullPayment = PRICES[config.type]?.paymentMode === "full";
  const depositEuros = (DEPOSIT_CENTS / 100).toFixed(0);
  const refundableEuros = (DEPOSIT_REFUNDABLE_CENTS / 100).toFixed(0);
  const nonRefundableEuros = ((DEPOSIT_CENTS - DEPOSIT_REFUNDABLE_CENTS) / 100).toFixed(0);
  const pieceLabel = selectedType?.label ?? t("pieceFallback");
  const shirtsIncluded = gift ? GIFT_PACKS[gift.packKey]?.shirtsIncluded ?? 0 : 0;

  function handlePay() {
    setLoading(true);
    setError(null);
    localStorage.setItem("sly_config", JSON.stringify(config));

    // Gift redemption: nothing to charge, the pack was already paid for at
    // purchase time on /experience. This single call both creates the paid
    // order and marks the gift code used (see sly-crm's POST
    // /api/gift-cards/:code/redeem) — no Stripe involved at all.
    if (gift) {
      const rows = buildSummaryRows(config, frConfiguratorT);
      if (shirtsIncluded > 0) {
        rows.push(["SLY Experience", `${shirtsIncluded} chemise${shirtsIncluded > 1 ? "s" : ""} incluse${shirtsIncluded > 1 ? "s" : ""} — tissu et coupe à définir avec Luc pendant le rendez-vous`]);
      }
      fetch("/api/redeem-gift-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giftCode: gift.code,
          customer: { firstName: config.firstName, lastName: config.lastName, email: config.email },
          config,
          configSummary: rows,
        }),
      })
        .then(async (r) => {
          const data = await r.json();
          if (!r.ok || !data.orderId) throw new Error("redeem_failed");
          window.location.href = `/customize/success?gift=1&orderId=${encodeURIComponent(data.orderId)}`;
        })
        .catch(() => {
          setError(t("errorMsg"));
          setLoading(false);
        });
      return;
    }

    fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: config.type,
        customer: { firstName: config.firstName, lastName: config.lastName, email: config.email, referredBy: config.referredBy || undefined },
        config,
        // Always French — this is what the CRM/Luc sees, see frTranslator.ts.
        configSummary: buildSummaryRows(config, frConfiguratorT),
      }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("payment_session_failed");
        const { url } = await r.json();
        if (!url) throw new Error("payment_session_failed");
        window.location.href = url;
      })
      .catch(() => {
        setError(t("errorMsg"));
        setLoading(false);
      });
  }

  if (gift) {
    return (
      <div className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.3em] text-cherry font-medium mb-4">SLY Experience</p>
        <h2 className="font-brand text-3xl md:text-4xl text-ink mb-2">Déjà réglé — plus rien à payer</h2>
        <p className="text-sm text-muted mb-8 font-light">
          Votre <strong className="text-ink font-medium">{gift.packLabel}</strong> a été offert et payé intégralement.
          Il ne vous reste qu&apos;à confirmer pour réserver votre rendez-vous vidéo avec Luc.
        </p>

        <div className="border border-border divide-y divide-border mb-8">
          <div className="flex justify-between px-6 py-4 bg-offwhite">
            <span className="text-sm text-ink font-medium">{pieceLabel} — {gift.packLabel}</span>
            <span className="text-sm text-choco font-medium">Réglé</span>
          </div>
          {shirtsIncluded > 0 && (
            <div className="flex justify-between px-6 py-4">
              <span className="text-sm text-muted font-light">
                + {shirtsIncluded} chemise{shirtsIncluded > 1 ? "s" : ""} incluse{shirtsIncluded > 1 ? "s" : ""}
              </span>
              <span className="text-sm text-muted font-light">à définir avec Luc</span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 px-5 py-4 bg-red-50 border border-red-200 text-sm text-red-800 font-light leading-relaxed">
            {error}
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={loading}
          className="px-8 py-4 bg-choco text-white text-sm tracking-wide hover:bg-ink transition-colors disabled:opacity-50"
        >
          {loading ? t("redirecting") : "Confirmer et réserver mon rendez-vous →"}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <p className="text-[11px] uppercase tracking-[0.3em] text-cherry font-medium mb-4">{t("eyebrow")}</p>
      <h2 className="font-brand text-3xl md:text-4xl text-ink mb-2">
        {isFullPayment ? t("paymentTitle") : t("depositTitle")}
      </h2>
      <p className="text-sm text-muted mb-8 font-light">
        {isFullPayment ? (
          <>
            {t("fullDescPrefix")} <strong className="text-ink font-medium">{displayPrice}</strong> {t("fullDescRest")}
          </>
        ) : (
          <>
            {t("depositDescPrefix")} <strong className="text-ink font-medium">{t("depositDescStrong", { deposit: depositEuros })}</strong> {t("depositDescMid")} <strong className="text-ink font-medium">{t("depositDescDeducted")}</strong> {t("depositDescMid2")} <strong className="text-ink font-medium">{t("depositDescRefund", { refundable: refundableEuros })}</strong> {t("depositDescSuffix", { nonRefundable: nonRefundableEuros })}
          </>
        )}
      </p>

      <div className="border border-border divide-y divide-border mb-8">
        {isFullPayment ? (
          <div className="flex justify-between px-6 py-4 bg-offwhite">
            <span className="text-sm text-ink font-medium">
              {pieceLabel}, {t("pieceNowDue")}{promo && <span className="text-choco"> ({promo.label})</span>}
            </span>
            <span className="text-sm text-ink font-medium">
              {promo && <span className="text-muted line-through mr-2">{selectedType?.price}</span>}
              {displayPrice}
            </span>
          </div>
        ) : (
          <>
            <div className="flex justify-between px-6 py-4">
              <span className="text-sm text-muted font-light">
                {pieceLabel}, {t("pieceTotalPrice")}{promo && <span className="text-choco"> ({promo.label})</span>}
              </span>
              <span className="text-sm text-ink font-medium">
                {promo && <span className="text-muted line-through mr-2">{selectedType?.price}</span>}
                {displayPrice}
              </span>
            </div>
            <div className="flex justify-between px-6 py-4 bg-offwhite">
              <span className="text-sm text-ink font-medium">{t("depositNowDue")}</span>
              <span className="text-sm text-ink font-medium">{depositEuros} €</span>
            </div>
            <div className="flex justify-between px-6 py-4">
              <span className="text-sm text-muted font-light">{t("balanceAtAppointment")}</span>
              <span className="text-sm text-muted font-light">{t("balanceRest")}</span>
            </div>
          </>
        )}
      </div>

      <div className="mb-8 px-5 py-4 bg-offwhite text-sm text-ink font-light leading-relaxed">
        <strong className="font-medium">{t("prepareStrong")}</strong> {t("prepareRest")}
      </div>

      {error && (
        <div className="mb-6 px-5 py-4 bg-red-50 border border-red-200 text-sm text-red-800 font-light leading-relaxed">
          {error}
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={loading}
        className="px-8 py-4 bg-choco text-white text-sm tracking-wide hover:bg-ink transition-colors disabled:opacity-50"
      >
        {loading
          ? t("redirecting")
          : isFullPayment ? t("payFullCta", { price: displayPrice }) : t("payDepositCta", { deposit: depositEuros })}
      </button>
    </div>
  );
}

/* ─── Main configurator ──────────────────────────────────────── */

// A configuration in progress is saved continuously (see the persistence
// effect below) under these keys, so quitting mid-flow — closing the tab,
// navigating away, a phone dying — never loses it. Browser-local only: there
// is no account system on this site, so "saved" means "saved on this
// device, in this browser," not recoverable from a different one. sly_config
// itself predates this feature (StepPayment already wrote it right before
// the Stripe redirect, so the success page could rebuild the Calendly
// prefill/email after returning from a full-page redirect) — reused rather
// than duplicated, the other three keys are new.
const DRAFT_STEP_KEY = "sly_customize_step";
const DRAFT_MAX_STEP_KEY = "sly_customize_max_step";
const DRAFT_SAVED_AT_KEY = "sly_customize_saved_at";
const DRAFT_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

type Draft = { config: Config; step: number; maxStepReached: number };

function readDraft(): Draft | null {
  if (typeof window === "undefined") return null;
  try {
    const rawConfig = localStorage.getItem("sly_config");
    const rawStep = localStorage.getItem(DRAFT_STEP_KEY);
    const rawSavedAt = localStorage.getItem(DRAFT_SAVED_AT_KEY);
    if (!rawConfig || !rawStep || !rawSavedAt) return null;

    const savedAt = Number(rawSavedAt);
    if (!Number.isFinite(savedAt) || Date.now() - savedAt > DRAFT_MAX_AGE_MS) return null;

    const step = Number(rawStep);
    // step 0 is just the very first question, answered or not — nothing
    // meaningful to offer resuming yet.
    if (!Number.isFinite(step) || step <= 0) return null;

    const config = JSON.parse(rawConfig) as Config;
    const rawMaxStep = localStorage.getItem(DRAFT_MAX_STEP_KEY);
    const maxStepReached = Number.isFinite(Number(rawMaxStep)) ? Number(rawMaxStep) : step;
    return { config, step, maxStepReached };
  } catch {
    return null;
  }
}

function clearDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("sly_config");
  localStorage.removeItem(DRAFT_STEP_KEY);
  localStorage.removeItem(DRAFT_MAX_STEP_KEY);
  localStorage.removeItem(DRAFT_SAVED_AT_KEY);
}

function CustomizeInner() {
  const t = useTranslations("Configurator");
  const tOccasion = useTranslations("Configurator.occasion");
  const tUi = useTranslations("Configurator.ui");
  const occasions = useLocalizedOptions("occasions", OCCASIONS);
  const buttonMaterials = useLocalizedOptions("buttonMaterials", BUTTON_MATERIALS);
  const shirtFits = useLocalizedOptions("shirtFits", SHIRT_FITS);
  const shirtCollars = useLocalizedOptions("shirtCollars", SHIRT_COLLARS);
  const shirtCuffs = useLocalizedOptions("shirtCuffs", SHIRT_CUFFS);
  const types = useLocalizedOptions("types", TYPES);
  const tResume = useTranslations("Configurator.resume");

  // The homepage's piece cards link here as ?type=suit|blazer|trousers|shirt
  // — honor that instead of asking the client to repeat a choice they just made.
  const searchParams = useSearchParams();
  const requestedType = searchParams.get("type");
  const initialType: ProductType =
    requestedType === "suit" || requestedType === "blazer" || requestedType === "trousers" || requestedType === "shirt"
      ? requestedType : "";

  // "SLY Experience" gift redemption — /experience/carte/[code] links here as
  // ?type=suit&giftCode=XXXX. Validated server-side (again, regardless of
  // this check) at redemption time by StepPayment's handlePay, but checked
  // here too so the whole flow can visibly say "already paid" rather than
  // silently accepting a bad or expired code until the very last step.
  const giftCode = searchParams.get("giftCode");
  const [gift, setGift] = useState<GiftState>(null);
  useEffect(() => {
    if (!giftCode) return;
    fetch(`/api/gift-cards/${encodeURIComponent(giftCode)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) setGift({ code: giftCode, packKey: data.packKey, packLabel: data.packLabel });
      })
      .catch(() => {});
  }, [giftCode]);

  // A gift redemption always starts a fresh session — mixing it with a
  // stale, unrelated draft (possibly from a totally different visit) would
  // be confusing at best and wrong at worst, so the draft check is skipped
  // entirely whenever ?giftCode= is present.
  //
  // Both start at a value that renders identically to "fresh" (the normal
  // stepper) and only change inside an effect, never in a lazy useState
  // initializer — readDraft() touches localStorage, which doesn't exist
  // during server rendering. Computing it during the initial render would
  // make the server's HTML (always "no draft") disagree with the client's
  // first render (which — running in the browser — really can see one),
  // which is exactly what a hydration mismatch is. Checking inside a
  // useEffect instead means the check only ever runs client-side, after
  // hydration has already reconciled against the server's "no draft" output.
  const [draft, setDraft] = useState<Draft | null>(null);
  const [resumeChoice, setResumeChoice] = useState<"checking" | "pending" | "resume" | "fresh">("checking");
  useEffect(() => {
    const found = giftCode ? null : readDraft();
    if (found) {
      setDraft(found);
      setResumeChoice("pending");
    } else {
      setResumeChoice("fresh");
    }
    // Deliberately empty deps — this is a one-time check on mount, not
    // something that should re-run if giftCode somehow changed later.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Always starts on "occasion" — asked before anything else, even when the
  // piece is already known from the link the client clicked. The "which
  // piece?" question itself is skipped on the way past it (see goNext below).
  const [step, setStep] = useState(0);
  // How far this session (or a resumed draft) has actually gotten — lets
  // StepBar allow free back-and-forth navigation across anything already
  // reached, without opening the door to jumping ahead into steps that were
  // never answered (see StepBar's `reachable` check).
  const [maxStepReached, setMaxStepReached] = useState(0);
  useEffect(() => {
    setMaxStepReached((m) => Math.max(m, step));
  }, [step]);

  const [config, setConfig] = useState<Config>({
    occasion: "", type: initialType, jacketStyle: "", jacketCut: "", closure: "", lining: "",
    monogram: false, monogramPlacement: "", monogramInitials: "", monogramColor: "",
    colorType: "", colorFamily: "", color: "", pattern: "",
    jacketButtons: "", lapel: "", lapelWidth: "",
    trouserCut: "", waistband: "", waistbandWidth: "", trouserButtons: "", pleats: "", hem: "",
    // No longer an explicit step — every trouser order always gets the full lining.
    trouserLining: "full",
    shirtFabric: "", shirtFit: "", shirtCollar: "", shirtCuff: "",
    height: "", weight: "", jacketSize: "", waistSize: "", neckSize: "", sleeveLength: "",
    hasTapeMeasure: "", shippingAddress: "", shippingCity: "", shippingZip: "",
    firstName: "", lastName: "", email: "", message: "", referredBy: "", promoCode: "",
  });

  function resumeDraft() {
    if (draft) {
      setConfig(draft.config);
      setStep(draft.step);
      setMaxStepReached(draft.maxStepReached);
    }
    setResumeChoice("resume");
  }
  function startFresh() {
    clearDraft();
    setResumeChoice("fresh");
  }

  // Saves continuously — every change to the config, not just at payment —
  // so quitting mid-flow (closing the tab, navigating away) never loses
  // progress. Gated on resumeChoice being resolved ("resume" or "fresh"):
  // writing while still "checking" or "pending" would silently overwrite
  // the very draft the prompt is about to offer, before the client has
  // chosen either option.
  useEffect(() => {
    if (resumeChoice === "checking" || resumeChoice === "pending") return;
    if (typeof window === "undefined") return;
    localStorage.setItem("sly_config", JSON.stringify(config));
    localStorage.setItem(DRAFT_STEP_KEY, String(step));
    localStorage.setItem(DRAFT_MAX_STEP_KEY, String(maxStepReached));
    localStorage.setItem(DRAFT_SAVED_AT_KEY, String(Date.now()));
  }, [config, step, maxStepReached, resumeChoice]);

  const set = (k: keyof Config, v: string | boolean) => setConfig((c) => ({ ...c, [k]: v }));

  // Suit flow: default the trouser buttons to whatever was chosen for the
  // jacket, and re-sync if the client goes back and changes the jacket
  // buttons later — but only while the trouser choice still reflects the
  // last auto-applied recommendation, never overriding a deliberate pick.
  // Lives here (not in StepTrouserButtons) because that step component
  // unmounts every time the client navigates away from it, which would
  // otherwise reset the "was this auto-applied" tracking right when it's
  // needed — this component is the one thing that stays mounted throughout.
  const lastAutoSyncedTrouserButtons = useRef<string | null>(null);
  useEffect(() => {
    if (!config.jacketButtons) return;
    const followsRecommendation = config.trouserButtons === "" || config.trouserButtons === lastAutoSyncedTrouserButtons.current;
    if (followsRecommendation && config.trouserButtons !== config.jacketButtons) {
      setConfig((prev) => ({ ...prev, trouserButtons: prev.jacketButtons }));
    }
    lastAutoSyncedTrouserButtons.current = config.jacketButtons;
  }, [config.jacketButtons, config.trouserButtons]);

  // Fired once, when the client completes the "contact" step — well before
  // payment — so an abandoned configuration still leaves a trace in the CRM.
  // Best-effort: never blocks or interrupts navigation if it fails.
  const leadCaptured = useRef(false);
  const captureLead = () => {
    if (leadCaptured.current) return;
    leadCaptured.current = true;
    fetch("/api/lead-capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: config.firstName,
        lastName: config.lastName,
        email: config.email,
        type: config.type,
        // Always French — this is what the CRM/Luc sees, see frTranslator.ts.
        configSummary: buildSummaryRows(config, frConfiguratorT),
      }),
    }).catch(() => {});
  };

  const steps = buildSteps(config.type);
  const totalSteps = steps.length;
  const currentKey = steps[step]?.key ?? "type";

  const canNext = isStepValid(currentKey, config);

  // Advances by one step — except it skips straight over "type" if that's
  // already answered (the ?type= deep link case): by the time normal forward
  // navigation would land on that step, config.type can only be non-empty
  // if it came from the URL prefill, since otherwise the client wouldn't
  // have reached it yet.
  function goNext(current: number) {
    let next = Math.min(totalSteps - 1, current + 1);
    if (steps[next]?.key === "type" && config.type) next = Math.min(totalSteps - 1, next + 1);
    setStep(next);
  }

  if (resumeChoice === "pending" && draft) {
    const draftTypeLabel = types.find((ty) => ty.id === draft.config.type)?.label ?? tResume("pieceFallback");
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="font-brand text-3xl text-ink mb-4">{tResume("title")}</h1>
          <p className="text-sm text-muted font-light leading-relaxed mb-8">
            {tResume("body", { piece: draftTypeLabel })}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={resumeDraft}
              className="px-8 py-4 bg-choco text-white text-sm tracking-wide hover:bg-ink transition-colors"
            >
              {tResume("resumeCta")}
            </button>
            <button
              onClick={startFresh}
              className="px-8 py-4 border border-border text-ink text-sm tracking-wide hover:border-ink transition-colors"
            >
              {tResume("freshCta")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-border bg-white sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-6 md:px-10 h-[70px] flex items-center justify-between">
          <Link href="/" className="font-brand text-xl tracking-[0.15em] uppercase text-ink">SLY Atelier</Link>
          <div className="flex items-center gap-6">
            <OffersDropdown align="right" />
            <Link href="/" className="text-xs text-muted hover:text-ink transition-colors">{tUi("quit")}</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 md:px-10 py-14 md:py-20 pb-28 md:pb-32">
        <StepBar steps={steps} current={step} maxStepReached={maxStepReached} onGoTo={setStep} />

        {currentKey === "occasion" && (
          <StepSimpleChoice title={tOccasion("title")} subtitle={tOccasion("subtitle")}
            options={occasions} value={config.occasion} onPick={(v) => set("occasion", v)} cols={2} />
        )}
        {currentKey === "type" && <StepType config={config} set={set} />}
        {currentKey === "jacket" && <StepJacket config={config} set={set} />}
        {currentKey === "jacketCut" && <StepJacketCut config={config} set={set} />}
        {currentKey === "closure" && <StepClosure config={config} set={set} />}
        {currentKey === "jacketButtons" && (
          <StepSimpleChoice title={t("jacketButtons.title")} subtitle={t("jacketButtons.subtitle")}
            options={buttonMaterials} value={config.jacketButtons} onPick={(v) => set("jacketButtons", v)} />
        )}
        {currentKey === "lining" && <StepLining config={config} set={set} />}
        {currentKey === "lapel" && <StepLapel config={config} set={set} />}
        {currentKey === "monogram" && <StepMonogram config={config} set={set} setConfig={setConfig} />}
        {currentKey === "color" && <StepColor config={config} setConfig={setConfig} />}
        {currentKey === "contact" && <StepContact config={config} set={set} />}
        {currentKey === "trouserCut" && <StepTrouserCut config={config} set={set} />}
        {currentKey === "waistband" && <StepWaistband config={config} set={set} />}
        {currentKey === "trouserButtons" && <StepTrouserButtons config={config} set={set} />}
        {currentKey === "pleats" && <StepPleats config={config} set={set} />}
        {currentKey === "hem" && <StepHem config={config} set={set} />}
        {currentKey === "shirtColor" && <StepShirtColor config={config} set={set} />}
        {currentKey === "shirtFit" && (
          <StepSimpleChoice title={t("shirtFit.title")} subtitle={t("shirtFit.subtitle")}
            options={shirtFits} value={config.shirtFit} onPick={(v) => set("shirtFit", v)} />
        )}
        {currentKey === "shirtCollar" && (
          <StepSimpleChoice title={t("shirtCollar.title")} subtitle={t("shirtCollar.subtitle")}
            options={shirtCollars} value={config.shirtCollar} onPick={(v) => set("shirtCollar", v)} />
        )}
        {currentKey === "shirtCuff" && (
          <StepSimpleChoice title={t("shirtCuff.title")} subtitle={t("shirtCuff.subtitle")} cols={2}
            options={shirtCuffs} value={config.shirtCuff} onPick={(v) => set("shirtCuff", v)} />
        )}
        {currentKey === "shirtMonogram" && (
          <StepMonogram
            config={config} set={set} setConfig={setConfig}
            placements={SHIRT_MONOGRAM_PLACEMENTS}
            subtitle={t("monogram.shirtSubtitle")}
          />
        )}
        {currentKey === "sizing" && <StepSizing config={config} set={set} />}
        {currentKey === "recap" && <StepTransition config={config} />}
        {currentKey === "payment" && <StepPayment config={config} gift={gift} />}
        {currentKey === "summary" && (
          <StepSummary
            config={config}
            set={set}
            onSubmit={() => goNext(step)}
          />
        )}

        {step < totalSteps - 1 && step !== totalSteps - 2 && (
          <div className="mt-12 flex items-center justify-between">
            <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
              className="text-sm text-muted hover:text-ink transition-colors disabled:opacity-30">{tUi("back")}</button>
            <button
              onClick={() => {
                if (currentKey === "contact") captureLead();
                goNext(step);
              }}
              disabled={!canNext}
              className="px-8 py-3.5 bg-choco text-white text-sm tracking-wide hover:bg-ink transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              {tUi("continue")}
            </button>
          </div>
        )}
      </div>

      <PriceBar config={config} currentKey={currentKey} gift={gift} />
    </div>
  );
}

export default function Customize() {
  return (
    <Suspense fallback={null}>
      <CustomizeInner />
    </Suspense>
  );
}
