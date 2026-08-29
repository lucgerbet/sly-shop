import { useTranslations } from "next-intl";
import FadeUp from "./FadeUp";

export default function Promise() {
  const t = useTranslations("Promise");

  const items = [
    { title: t("item1Title"), body: t("item1Body") },
    { title: t("item2Title"), body: t("item2Body") },
    { title: t("item3Title"), body: t("item3Body") },
    { title: t("item4Title"), body: t("item4Body") },
    { title: t("item5Title"), body: t("item5Body") },
    { title: t("item6Title"), body: t("item6Body") },
  ];

  return (
    <section id="promise" className="border-t border-border bg-offwhite py-24 md:py-32 px-6 md:px-10">
      <div className="mx-auto max-w-7xl">

        <FadeUp className="mb-16 max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-cherry mb-3 font-medium">{t("eyebrow")}</p>
          <h2 className="font-brand text-4xl md:text-5xl text-ink mb-4">
            {t("heading")}
          </h2>
          <p className="text-sm text-muted font-light leading-relaxed">
            {t("subheading")}
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border border border-border">
          {items.map((item, i) => (
            <FadeUp key={item.title} delay={i * 80}>
              <div className="bg-white px-8 py-10 h-full">
                <div className="w-8 h-px bg-cherry mb-6" />
                <h3 className="text-base font-medium text-ink mb-3">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted font-light">{item.body}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
