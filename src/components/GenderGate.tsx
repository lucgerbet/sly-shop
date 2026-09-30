import { useTranslations } from "next-intl";
import Image from "next/image";
import NextLink from "next/link";

// The very first thing visitors see: a two-panel gate to pick a universe
// before anything else on the homepage loads. Men's side scrolls down into
// the existing homepage (id="mens-universe" on Hero's own section) since
// that content already *is* the men's experience. Women's side leaves
// [locale] entirely for /femme — no catalogue/prices exist for women yet
// (see the bespoke-reproduction roadmap's Phase 3), so it's a teaser + lead
// capture, not a dead end into an empty configurator.
export default function GenderGate() {
  const t = useTranslations("GenderGate");

  return (
    <section className="relative flex flex-col md:flex-row h-[100dvh] overflow-hidden">
      {/* Homme */}
      <a
        href="#mens-universe"
        className="group relative flex-1 flex items-end md:items-center justify-center overflow-hidden"
      >
        <Image
          src="/photos/hero.jpg"
          alt={t("mensImageAlt")}
          fill
          className="object-cover object-[center_30%] transition-transform duration-700 group-hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-ink/35 group-hover:bg-ink/45 transition-colors duration-500" />
        <div className="relative z-10 text-center px-6 pb-16 md:pb-0">
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/70 mb-4">{t("eyebrow")}</p>
          <h2 className="font-brand text-5xl md:text-6xl text-white mb-5">{t("mensLabel")}</h2>
          <p className="text-sm text-white/80 font-light mb-6 max-w-xs mx-auto">{t("mensSub")}</p>
          <span className="inline-flex items-center gap-2 text-[13px] tracking-wide text-white border-b border-white/40 pb-1 group-hover:border-white transition-colors">
            {t("mensCta")}
            <svg viewBox="0 0 12 12" className="w-3 h-3 transition-transform group-hover:translate-y-0.5" fill="none">
              <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </a>

      {/* Femme */}
      <NextLink
        href="/femme"
        className="group relative flex-1 flex items-center justify-center bg-ink overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-choco/40 via-ink to-ink transition-opacity duration-500 group-hover:opacity-80" />
        <div className="relative z-10 text-center px-6">
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/50 mb-4">{t("eyebrow")}</p>
          <h2 className="font-brand text-5xl md:text-6xl text-white mb-5">{t("womensLabel")}</h2>
          <p className="text-sm text-white/70 font-light mb-6 max-w-xs mx-auto">{t("womensSub")}</p>
          <span className="inline-flex items-center gap-2 text-[13px] tracking-wide text-white border-b border-white/30 pb-1 group-hover:border-white transition-colors">
            {t("womensCta")}
            <svg viewBox="0 0 12 12" className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none">
              <path d="M2.5 2.5L8 6L2.5 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </NextLink>
    </section>
  );
}
