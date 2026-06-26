import Link from "next/link";
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

          {/* Photo placeholder */}
          <FadeUp>
            <div className="relative aspect-[3/4] bg-offwhite overflow-hidden flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-border mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl text-muted">L</span>
                </div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-muted">
                  Photo de Luc — bientôt
                </p>
              </div>
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
