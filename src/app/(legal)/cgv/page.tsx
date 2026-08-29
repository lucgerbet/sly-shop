import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Conditions générales de vente — SLY Atelier",
  description: "Conditions générales de vente de SLY Atelier : acompte, délais de production, livraison et droit de rétractation pour les pièces sur mesure.",
};

export default function CGV() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-[70px]">
        <div className="mx-auto max-w-3xl px-6 md:px-10 py-20">
        <Link href="/" className="text-sm text-muted hover:text-ink transition-colors">← Retour à l&apos;accueil</Link>
        <h1 className="font-brand text-4xl text-ink mt-8 mb-10">Conditions générales de vente</h1>

        <div className="flex flex-col gap-8 text-sm text-muted font-light leading-relaxed">
          <section>
            <h2 className="text-ink font-medium mb-2">1. Objet</h2>
            <p>
              Les présentes conditions générales de vente régissent les commandes de pièces vestimentaires sur
              mesure (costumes, blazers, pantalons) passées sur le site SLY Atelier auprès de Luc Gerbet.
            </p>
          </section>

          <section>
            <h2 className="text-ink font-medium mb-2">2. Processus de commande</h2>
            <p>
              Le client configure les caractéristiques générales de sa pièce via le configurateur en ligne, réserve
              un rendez-vous vidéo, puis règle le montant total de la commande. Le tissu, les boutons et les mesures
              précises sont déterminés lors du rendez-vous vidéo avec Luc.
            </p>
          </section>

          <section>
            <h2 className="text-ink font-medium mb-2">3. Prix et acompte</h2>
            <p>
              Les prix sont indiqués en euros, toutes taxes comprises. Le prix du costume deux pièces est de 645 €
              (575 € sur présentation d&apos;un code promotionnel valide). Pour réserver
              le rendez-vous vidéo, un acompte de 150 € est réglé en ligne. Cet acompte est déduit du prix total de
              la commande. Le solde est réglé après validation des choix et des mesures lors du rendez-vous.
            </p>
          </section>

          <section>
            <h2 className="text-ink font-medium mb-2">4. Droit de rétractation</h2>
            <p>
              Conformément à l&apos;article L221-28 du Code de la consommation, le droit de rétractation ne
              s&apos;applique pas aux biens confectionnés selon les spécifications du consommateur ou nettement
              personnalisés. Les pièces SLY Atelier étant fabriquées sur mesure selon les choix et mensurations du
              client, <strong className="text-ink font-medium">aucun droit de rétractation légal ne s&apos;applique</strong> une
              fois la production lancée.
            </p>
          </section>

          <section>
            <h2 className="text-ink font-medium mb-2">5. Acompte et remboursement</h2>
            <p>
              Si, après le rendez-vous vidéo, le client décide de ne pas finaliser sa commande, 75 € de l&apos;acompte
              de 150 € lui sont remboursés ; les 75 € restants sont conservés au titre du temps de consultation. Si
              SLY Atelier se trouve dans l&apos;impossibilité d&apos;honorer une commande déjà finalisée (annulation
              par l&apos;atelier, impossibilité de produire une pièce conforme), le client est intégralement remboursé
              des sommes versées.
            </p>
          </section>

          <section>
            <h2 className="text-ink font-medium mb-2">6. Délai de livraison</h2>
            <p>
              Le délai de production et de livraison est de 2 à 3 semaines à compter de la validation des mesures
              lors du rendez-vous vidéo.
            </p>
          </section>

          <section>
            <h2 className="text-ink font-medium mb-2">7. Contrôle qualité</h2>
            <p>
              Chaque pièce est inspectée avant expédition. Si un défaut de fabrication est constaté à la livraison,
              le client dispose de 7 jours pour le signaler par email à contact@sly-atelier.com en vue d&apos;une
              reprise ou d&apos;un remake.
            </p>
          </section>

          <section>
            <h2 className="text-ink font-medium mb-2">8. Droit applicable</h2>
            <p>Les présentes conditions sont soumises au droit français.</p>
          </section>
        </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
