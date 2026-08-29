import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Hero() {
  const t = useTranslations("Hero");

  const strip = [
    { label: t("stripPrice"), value: t("stripPriceValue") },
    { label: t("stripDelay"), value: t("stripDelayValue") },
    { label: t("stripAppointment"), value: t("stripAppointmentValue") },
  ];

  return (
    <section className="relative flex flex-col md:flex-row md:min-h-screen bg-offwhite overflow-hidden">

      {/* Left — text */}
      <div className="relative z-10 order-2 md:order-1 flex flex-col justify-center md:justify-center w-full md:w-1/2 px-6 md:px-14 lg:px-20 pb-8 md:pb-0 pt-8 md:pt-0">
        <div className="max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.35em] text-choco mb-6 font-medium">
            {t("eyebrow")}
          </p>

          <h1 className="font-brand text-5xl sm:text-6xl md:text-6xl lg:text-[76px] leading-[1.05] text-ink mb-8">
            {t.rich("title", {
              em: (chunks) => <em className="not-italic text-choco">{chunks}</em>,
            })}
          </h1>

          <p className="text-base md:text-lg text-ink/70 leading-relaxed max-w-md mb-10 font-light">
            {t.rich("description", {
              price: (chunks) => <strong className="text-cherry font-medium">{chunks}</strong>,
            })}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/customize"
              className="inline-flex items-center justify-center px-8 py-4 bg-choco text-white text-sm tracking-wide hover:bg-ink transition-colors"
            >
              {t("configureCta")}
            </Link>
            <Link
              href="/#process"
              className="inline-flex items-center justify-center px-8 py-4 border border-ink/25 text-ink text-sm tracking-wide hover:border-ink transition-colors"
            >
              {t("howItWorksCta")}
            </Link>
          </div>
        </div>
      </div>

      {/* Right — editorial photo */}
      <div className="relative order-1 md:order-2 w-full md:w-1/2 h-[80vw] sm:h-[60vw] md:h-auto min-h-[320px] md:min-h-0 mt-16 md:mt-0">
        <Image
          src="/photos/hero.jpg"
          alt={t("imageAlt")}
          fill
          className="object-cover object-[center_44%] md:object-[center_50%]"
          priority
        />
        {/* subtle overlay for polish */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-offwhite/10" />
      </div>

      {/* Value strip — full width at bottom (desktop only overlays the photo) */}
      <div className="relative order-3 md:absolute md:bottom-0 md:left-0 md:right-0 border-t border-ink/10 bg-white/80 backdrop-blur-sm z-20">
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-ink/10">
          {strip.map((item) => (
            <div key={item.label} className="sm:px-10 first:pl-0 last:pr-0 py-3 sm:py-0 flex sm:flex-col gap-2 sm:gap-1 items-center sm:items-start">
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted order-2 sm:order-1">{item.label}</span>
              <span className="text-xl font-medium text-ink order-1 sm:order-2">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
