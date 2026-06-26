import Link from "next/link";
import Image from "next/image";
import FadeUp from "./FadeUp";

const requirements = [
  {
    icon: "👤",
    title: "Une autre personne",
    desc: "Pour tenir le mètre et noter les mesures pendant que vous restez droit et naturel.",
  },
  {
    icon: "📏",
    title: "Un mètre ruban",
    desc: "Souple, de couturière. Disponible en pharmacie ou en mercerie pour moins de 2 €.",
  },
  {
    icon: "🕐",
    title: "1 heure devant vous",
    desc: "Le rendez-vous dure 45 min en moyenne. Prévoir un peu de marge pour ne pas être pressé.",
  },
  {
    icon: "🤫",
    title: "Un endroit calme",
    desc: "Connexion stable, bonne lumière. Une pièce sans bruit de fond pour qu'on puisse bien communiquer.",
  },
];

export default function LucSection() {
  return (
    <section className="border-t border-border py-24 md:py-32 px-6 md:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Top — intro */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-20 md:mb-28">

          {/* Luc's photo — vintage film effect */}
          <FadeUp>
            <div className="relative aspect-[3/4] overflow-hidden">
              {/* SVG grain filter */}
              <svg className="absolute w-0 h-0">
                <defs>
                  <filter id="vintage-grain" x="0%" y="0%" width="100%" height="100%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="noise"/>
                    <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise"/>
                    <feBlend in="SourceGraphic" in2="grayNoise" mode="multiply" result="blended"/>
                    <feComponentTransfer in="blended">
                      <feFuncR type="linear" slope="0.88" intercept="0.05"/>
                      <feFuncG type="linear" slope="0.82" intercept="0.04"/>
                      <feFuncB type="linear" slope="0.72" intercept="0.02"/>
                    </feComponentTransfer>
                  </filter>
                </defs>
              </svg>
              <Image
                src="/photos/luc.jpg"
                alt="Luc — SLY Atelier"
                fill
                className="object-cover object-top"
                style={{ filter: "sepia(0.35) contrast(1.12) brightness(0.88) saturate(0.75)" }}
              />
              {/* Grain overlay */}
              <div
                className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
                  backgroundSize: "128px 128px",
                }}
              />
              {/* Vignette */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.35) 100%)" }} />
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

        {/* Bottom — requirements */}
        <FadeUp>
          <div className="border-t border-border pt-14">
            <p className="text-[11px] uppercase tracking-[0.3em] text-cherry font-medium mb-10">
              Ce dont vous avez besoin pour le rendez-vous
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {requirements.map((req) => (
                <div key={req.title} className="flex flex-col gap-3">
                  <span className="text-2xl">{req.icon}</span>
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
