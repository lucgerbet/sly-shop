import FadeUp from "./FadeUp";

const items = [
  {
    title: "Sur mesure réel",
    body: "Chaque pièce est produite selon vos mesures exactes, validées lors du rendez-vous. Pas de taille standard.",
  },
  {
    title: "Prix transparent",
    body: "550 € tout inclus : rendez-vous, production, contrôle qualité et livraison. Aucun frais caché.",
  },
  {
    title: "Contrôle avant expédition",
    body: "Votre pièce est inspectée avant d'être expédiée. Elle quitte l'atelier uniquement si elle est conforme.",
  },
  {
    title: "Suivi après livraison",
    body: "Luc reste disponible après réception pour répondre à vos questions et vous guider si besoin.",
  },
];

export default function Promise() {
  return (
    <section id="promise" className="border-t border-border bg-offwhite py-24 md:py-32 px-6 md:px-10">
      <div className="mx-auto max-w-7xl">

        <FadeUp className="mb-16 max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-cherry mb-3 font-medium">Notre promesse</p>
          <h2 className="font-brand text-4xl md:text-5xl text-ink">
            Commander sur mesure
            <br />en ligne, sans risque.
          </h2>
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
