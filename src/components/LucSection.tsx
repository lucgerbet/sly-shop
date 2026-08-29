import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import FadeUp from "./FadeUp";

export default function LucSection() {
  const t = useTranslations("LucSection");

  const requirements = [
    { n: "01", title: t("req1Title"), desc: t("req1Desc") },
    { n: "02", title: t("req2Title"), desc: t("req2Desc") },
    { n: "03", title: t("req3Title"), desc: t("req3Desc") },
    { n: "04", title: t("req4Title"), desc: t("req4Desc") },
  ];

  return (
    <section className="border-t border-border py-24 md:py-32 px-6 md:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Top — intro */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-20 md:mb-28">

          {/* Luc's photo */}
          <FadeUp>
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src="/photos/luc.jpg"
                alt={t("photoAlt")}
                fill
                className="object-cover object-top"
              />
            </div>
          </FadeUp>

          {/* Text */}
          <FadeUp delay={120} className="flex flex-col gap-6">
            <p className="text-[11px] uppercase tracking-[0.3em] text-cherry font-medium">
              {t("eyebrow")}
            </p>
            <h2 className="font-brand text-4xl md:text-5xl text-ink leading-tight">
              {t("heading")}
            </h2>
            <p className="text-base md:text-lg text-muted leading-relaxed font-light">
              {t("paragraph1")}
            </p>
            <p className="text-base md:text-lg text-muted leading-relaxed font-light">
              {t("paragraph2")}
            </p>
            <p className="text-base md:text-lg text-muted leading-relaxed font-light">
              {t("paragraph3")}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-8 gap-y-3">
              <Link
                href="/customize"
                className="inline-flex items-center gap-3 text-sm tracking-wide text-ink border-b border-ink pb-1 hover:text-choco hover:border-choco transition-colors"
              >
                {t("bookCta")}
                <span>→</span>
              </Link>
              <Link
                href="/notre-histoire"
                className="inline-flex items-center gap-3 text-sm tracking-wide text-muted border-b border-border pb-1 hover:text-choco hover:border-choco transition-colors"
              >
                {t("storyCta")}
                <span>→</span>
              </Link>
            </div>
          </FadeUp>
        </div>

        {/* Bottom — requirements */}
        <FadeUp>
          <div className="border-t border-border pt-14">
            <p className="text-[11px] uppercase tracking-[0.3em] text-cherry font-medium mb-10">
              {t("requirementsEyebrow")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {requirements.map((req) => (
                <div key={req.title} className="flex flex-col gap-3">
                  <span className="font-brand text-3xl text-border leading-none">{req.n}</span>
                  <h3 className="font-medium text-ink text-base">{req.title}</h3>
                  <p className="text-sm text-muted font-light leading-relaxed">{req.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>

      </div>
    </section>
  );
}
