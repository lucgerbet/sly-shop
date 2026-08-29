import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import FadeUp from "./FadeUp";

export default function CTABanner() {
  const t = useTranslations("CTABanner");

  const stats = [
    [t("stat1Value"), t("stat1Label")],
    [t("stat2Value"), t("stat2Label")],
    [t("stat3Value"), t("stat3Label")],
    [t("stat4Value"), t("stat4Label")],
  ];

  return (
    <section className="border-t border-border bg-choco py-24 md:py-32 px-6 md:px-10">
      <div className="mx-auto max-w-7xl">
        <FadeUp className="flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/50 mb-4 font-medium">
              {t("eyebrow")}
            </p>
            <h2 className="font-brand text-4xl md:text-5xl lg:text-6xl text-white leading-tight">
              {t("heading")}
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <Link
              href="/customize"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-choco text-sm tracking-wide hover:bg-offwhite transition-colors"
            >
              {t("configureCta")}
            </Link>
            <Link
              href="/#process"
              className="inline-flex items-center justify-center px-8 py-4 border border-white/30 text-white text-sm tracking-wide hover:border-white/60 transition-colors"
            >
              {t("learnMoreCta")}
            </Link>
          </div>
        </FadeUp>

        <FadeUp delay={100} className="mt-16 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(([val, label]) => (
            <div key={label}>
              <p className="font-brand text-3xl text-white mb-1">{val}</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">{label}</p>
            </div>
          ))}
        </FadeUp>
      </div>
    </section>
  );
}
