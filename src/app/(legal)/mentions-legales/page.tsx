import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Mentions légales — SLY Atelier",
  description: "Informations légales sur SLY Atelier : éditeur du site, hébergement, et coordonnées.",
};

export default function MentionsLegales() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-[70px]">
        <div className="mx-auto max-w-3xl px-6 md:px-10 py-20">
        <Link href="/" className="text-sm text-muted hover:text-ink transition-colors">← Retour à l&apos;accueil</Link>
        <h1 className="font-brand text-4xl text-ink mt-8 mb-10">Mentions légales</h1>

        <div className="flex flex-col gap-8 text-sm text-muted font-light leading-relaxed">
          <section>
            <h2 className="text-ink font-medium mb-2">Éditeur du site</h2>
            <p>
              SLY Atelier<br />
              Entreprise individuelle (auto-entrepreneur), Luc Gerbet<br />
              232 chemin du Mas d&apos;Iglon, 30230 Bouillargues, France<br />
              SIRET : 103 121 422 00010<br />
              Responsable de la publication : Luc Gerbet<br />
              Email : contact@sly-atelier.com
            </p>
          </section>

          <section>
            <h2 className="text-ink font-medium mb-2">Hébergement</h2>
            <p>
              Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.
            </p>
          </section>

          <section>
            <h2 className="text-ink font-medium mb-2">Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble des contenus présents sur ce site (textes, visuels, identité de marque) est la propriété
              de SLY Atelier, sauf mention contraire. Toute reproduction sans autorisation est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-ink font-medium mb-2">Paiement</h2>
            <p>
              Les paiements en ligne sont traités par Stripe Payments Europe, Ltd. SLY Atelier ne stocke aucune
              donnée bancaire.
            </p>
          </section>

          <section>
            <h2 className="text-ink font-medium mb-2">Médiation de la consommation</h2>
            <p>
              Conformément à l&apos;article L.616-1 du Code de la consommation, tout consommateur a le droit de
              recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable d&apos;un litige.
            </p>
          </section>
        </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
