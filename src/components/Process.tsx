import FadeUp from "./FadeUp";

const steps = [
  {
    n: "01",
    title: "Configurez en ligne",
    body: "Choisissez votre pièce (costume, blazer ou pantalon), votre style et vos préférences de couleur et coupe.",
  },
  {
    n: "02",
    title: "Rendez-vous avec Luc",
    body: "Un appel vidéo privé pour affiner votre style, valider vos choix et prendre vos mesures ensemble, étape par étape.",
  },
  {
    n: "03",
    title: "Production sur mesure",
    body: "Votre pièce est confectionnée selon votre brief validé par des artisans expérimentés.",
  },
  {
    n: "04",
    title: "Livraison en 2 – 3 semaines",
    body: "Votre costume est contrôlé avant expédition. Luc reste disponible après réception pour vous accompagner.",
  },
];

export default function Process() {
  return (
    <section id="process" className="border-t border-border bg-offwhite py-24 md:py-32 px-6 md:px-10">
      <div className="mx-auto max-w-7xl">

        <FadeUp className="mb-16 max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-cherry mb-3 font-medium">Processus</p>
          <h2 className="font-brand text-4xl md:text-5xl text-ink">
            Simple. Guidé. Personnel.
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
