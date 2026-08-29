import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import FadeUp from "./FadeUp";

const CATEGORY_IDS = ["suit", "blazer", "trousers", "shirt"] as const;

const PHOTOS: Record<(typeof CATEGORY_IDS)[number], string | null> = {
  suit: "/photos/cat-suit.jpg",
  blazer: "/photos/cat-blazer.jpg",
  trousers: "/photos/cat-trousers.jpg",
  // No real product photo yet — a plain color block instead of an image,
  // never a placeholder photo standing in for one that doesn't exist.
  shirt: null,
};

const OBJECT_POSITIONS: Record<(typeof CATEGORY_IDS)[number], string> = {
  suit: "center 15%",
  blazer: "center 10%",
  trousers: "center 30%",
  shirt: "center",
};

export default function Categories() {
  const t = useTranslations("Categories");

  return (
    <section id="categories" className="border-t border-border py-24 md:py-32 px-6 md:px-10">
      <div className="mx-auto max-w-7xl">

        <FadeUp className="mb-14">
          <p className="text-[11px] uppercase tracking-[0.3em] text-cherry mb-3 font-medium">{t("eyebrow")}</p>
          <h2 className="font-brand text-4xl md:text-5xl text-ink">{t("heading")}</h2>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {CATEGORY_IDS.map((id, i) => {
            const featured = id === "suit";
            const photo = PHOTOS[id];
            return (
              <FadeUp key={id} delay={i * 80}>
                <Link
                  href={`/customize?type=${id}`}
                  className={`group flex flex-col h-full px-8 py-10 transition-colors ${
                    featured ? "bg-choco text-white" : "bg-white hover:bg-offwhite"
                  }`}
                >
                  <div className="relative w-full aspect-[4/5] mb-8 overflow-hidden">
                    {photo ? (
                      <Image
                        src={photo}
                        alt={t(`${id}.photoAlt`)}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        style={{ objectPosition: OBJECT_POSITIONS[id] }}
                      />
                    ) : (
                      <div className={`w-full h-full ${featured ? "bg-white/10" : "bg-offwhite"}`} />
                    )}
                  </div>

                  <p className={`text-[10px] uppercase tracking-[0.3em] mb-2 ${featured ? "text-white/60" : "text-muted"}`}>
                    {t(`${id}.sub`)}
                  </p>
                  <h3 className={`font-brand text-2xl md:text-3xl mb-2 ${featured ? "text-white" : "text-ink"}`}>
                    {t(`${id}.label`)}
                  </h3>
                  <p className={`text-sm leading-relaxed mb-6 font-light flex-1 ${featured ? "text-white/70" : "text-muted"}`}>
                    {t(`${id}.description`)}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-base font-medium ${featured ? "text-white" : "text-cherry"}`}>
                      {t(`${id}.price`)}
                    </span>
                    <span className={`text-[12px] tracking-wide underline underline-offset-4 ${featured ? "text-white/80" : "text-ink"}`}>
                      {t("configureCta")}
                    </span>
                  </div>
                </Link>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}
