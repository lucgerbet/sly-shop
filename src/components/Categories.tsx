import Link from "next/link";
import Image from "next/image";
import FadeUp from "./FadeUp";

const categories = [
  {
    id: "suit",
    label: "Costume Deux Pièces",
    sub: "La formule complète",
    price: "À partir de 550 €",
    description: "Blazer et pantalon assortis, taillés sur mesure selon vos proportions et votre style.",
    featured: true,
    photo: "/photos/cat-suit.jpg",
    photoAlt: "Costume rayures DiCaprio",
    objectPosition: "center 15%",
  },
  {
    id: "blazer",
    label: "Blazer sur mesure",
    sub: "Haut uniquement",
    price: "À partir de 320 €",
    description: "Un blazer seul pour compléter un pantalon existant ou porter en casual.",
    featured: false,
    photo: "/photos/cat-blazer.jpg",
    photoAlt: "Blazer blanc Scarface",
    objectPosition: "center 20%",
  },
  {
    id: "trousers",
    label: "Pantalon sur mesure",
    sub: "Bas uniquement",
    price: "À partir de 230 €",
    description: "Pantalon de costume ou chino, coupé selon votre morphologie et vos préférences.",
    featured: false,
    photo: "/photos/cat-trousers.jpg",
    photoAlt: "Pantalon costume rayures",
    objectPosition: "center 30%",
  },
];

export default function Categories() {
  return (
    <section id="categories" className="border-t border-border py-24 md:py-32 px-6 md:px-10">
      <div className="mx-auto max-w-7xl">

        <FadeUp className="mb-14">
          <p className="text-[11px] uppercase tracking-[0.3em] text-cherry mb-3 font-medium">Collection</p>
          <h2 className="font-brand text-4xl md:text-5xl text-ink">
            Choisissez votre pièce
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {categories.map((cat, i) => (
            <FadeUp key={cat.id} delay={i * 80}>
              <Link
                href={`/customize?type=${cat.id}`}
                className={`group flex flex-col h-full px-8 py-10 transition-colors ${
                  cat.featured ? "bg-choco text-white" : "bg-white hover:bg-offwhite"
                }`}
              >
                {/* Editorial photo */}
                <div className="relative w-full aspect-[4/5] mb-8 overflow-hidden">
                  <Image
                    src={cat.photo}
                    alt={cat.photoAlt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ objectPosition: cat.objectPosition }}
                  />
                </div>

                <p className={`text-[10px] uppercase tracking-[0.3em] mb-2 ${cat.featured ? "text-white/60" : "text-muted"}`}>
                  {cat.sub}
                </p>
                <h3 className={`font-brand text-2xl md:text-3xl mb-2 ${cat.featured ? "text-white" : "text-ink"}`}>
                  {cat.label}
                </h3>
                <p className={`text-sm leading-relaxed mb-6 font-light flex-1 ${cat.featured ? "text-white/70" : "text-muted"}`}>
                  {cat.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`text-base font-medium ${cat.featured ? "text-white" : "text-cherry"}`}>
                    {cat.price}
                  </span>
                  <span className={`text-[12px] tracking-wide underline underline-offset-4 ${cat.featured ? "text-white/80" : "text-ink"}`}>
                    Configurer →
                  </span>
                </div>
              </Link>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
