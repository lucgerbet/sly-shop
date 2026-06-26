import Link from "next/link";
import Image from "next/image";
import FadeUp from "./FadeUp";

export default function LucSection() {
  return (
    <section className="border-t border-border py-24 md:py-32 px-6 md:px-10">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

        {/* Editorial photo */}
        <FadeUp>
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image
              src="/photos/luc.jpg"
              alt="Portrait en costume"
              fill
              className="object-cover object-top"
            />
          </div>
        </FadeUp>

        {/* Text */}
        <FadeUp delay={120} className="flex flex-col gap-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-cherry font-medium">
            Votre styliste
          </p>
          <h2 className="font-brand text-4xl md:text-5xl text-ink leading-tight">
            Un rendez-vous
            <br />
            avec Luc.
          </h2>
          <p className="text-base md:text-lg text-muted leading-relaxed font-light">
            Chaque costume commence par un appel privé. Luc vous guide sur le choix
            du style, de la coupe et des détails, puis prend vos mesures avec vous
            en direct — même à distance.
          </p>
          <p className="text-base md:text-lg text-muted leading-relaxed font-light">
            Pas de boutique, pas de file d&apos;attente. Juste vous, Luc, et le costume
            qu&apos;il vous faut.
          </p>
          <div className="mt-2">
            <Link
              href="/customize"
              className="inline-flex items-center gap-3 text-sm tracking-wide text-ink border-b border-ink pb-1 hover:text-choco hover:border-choco transition-colors"
            >
              Prendre rendez-vous
              <span>→</span>
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
