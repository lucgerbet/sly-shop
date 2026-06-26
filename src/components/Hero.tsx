import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col md:flex-row bg-offwhite overflow-hidden">

      {/* Left — text */}
      <div className="relative z-10 flex flex-col justify-end md:justify-center w-full md:w-1/2 px-6 md:px-14 lg:px-20 pb-0 md:pb-0 pt-32 md:pt-0">
        <div className="max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.35em] text-choco mb-6 font-medium">
            Costume sur mesure · En ligne
          </p>

          <h1 className="font-brand text-5xl sm:text-6xl md:text-6xl lg:text-[76px] leading-[1.05] text-ink mb-8">
            Un costume
            <br />
            <em className="not-italic text-choco">taillé</em> pour
            <br />
            vous.
          </h1>

          <p className="text-base md:text-lg text-ink/70 leading-relaxed max-w-md mb-10 font-light">
            Deux pièces sur mesure à <strong className="text-cherry font-medium">550 €</strong>,
            livré en 2 à 3 semaines. Rendez-vous privé avec Luc pour définir
            votre style et prendre vos mesures ensemble.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/customize"
              className="inline-flex items-center justify-center px-8 py-4 bg-choco text-white text-sm tracking-wide hover:bg-ink transition-colors"
            >
              Configurer mon costume
            </Link>
            <Link
              href="#process"
              className="inline-flex items-center justify-center px-8 py-4 border border-ink/25 text-ink text-sm tracking-wide hover:border-ink transition-colors"
            >
              Comment ça marche
            </Link>
          </div>
        </div>
      </div>

      {/* Right — editorial photo */}
      <div className="relative w-full md:w-1/2 h-[55vw] md:h-auto min-h-[400px] mt-12 md:mt-0">
        <Image
          src="/photos/hero.jpg"
          alt="Costume sur mesure SLY Atelier"
          fill
          className="object-cover object-top"
          priority
        />
        {/* subtle overlay for polish */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-offwhite/10" />
      </div>

      {/* Value strip — full width at bottom */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-ink/10 bg-white/80 backdrop-blur-sm z-20">
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-ink/10">
          {[
            { label: "Prix tout inclus", value: "550 €" },
            { label: "Délai de livraison", value: "2 – 3 semaines" },
            { label: "Rendez-vous avec Luc", value: "Inclus" },
          ].map((item) => (
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
