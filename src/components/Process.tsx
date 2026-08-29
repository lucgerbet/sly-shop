import { useTranslations } from "next-intl";
import FadeUp from "./FadeUp";

export default function Process() {
  const t = useTranslations("Process");

  const steps = [
    { n: "01", title: t("step1Title"), body: t("step1Body") },
    { n: "02", title: t("step2Title"), body: t("step2Body") },
    { n: "03", title: t("step3Title"), body: t("step3Body") },
    { n: "04", title: t("step4Title"), body: t("step4Body") },
  ];

  return (
    <section id="process" className="border-t border-border bg-offwhite py-24 md:py-32 px-6 md:px-10">
      <div className="mx-auto max-w-7xl">

        <FadeUp className="mb-16 max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-cherry mb-3 font-medium">{t("eyebrow")}</p>
          <h2 className="font-brand text-4xl md:text-5xl text-ink">
            {t("heading")}
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
          {steps.map((step, i) => (
            <FadeUp key={step.n} delay={i * 100} className="flex gap-8">
              <span className="font-brand text-5xl text-border shrink-0 leading-none mt-1">
                {step.n}
              </span>
              <div>
                <h3 className="text-lg font-medium text-ink mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted font-light">{step.body}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
