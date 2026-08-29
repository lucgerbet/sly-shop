import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Politique de confidentialité — SLY Atelier",
  description: "Comment SLY Atelier collecte, utilise et protège vos données personnelles : RGPD, prestataires tiers, et vos droits.",
};

export default function Confidentialite() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-[70px]">
        <div className="mx-auto max-w-3xl px-6 md:px-10 py-20">
        <Link href="/" className="text-sm text-muted hover:text-ink transition-colors">← Retour à l&apos;accueil</Link>
        <h1 className="font-brand text-4xl text-ink mt-8 mb-10">Politique de confidentialité</h1>

        <div className="flex flex-col gap-8 text-sm text-muted font-light leading-relaxed">
          <section>
            <h2 className="text-ink font-medium mb-2">Données collectées</h2>
            <p>
              Dès que vous renseignez votre nom et votre email dans le configurateur — même sans finaliser de
              commande — SLY Atelier les enregistre pour pouvoir reprendre l&apos;échange si besoin. En cas de
              commande, sont en plus collectés : mensurations approximatives (taille, poids, taille de veste retail),
              préférences de configuration (coupe, style, couleur), et le cas échéant une adresse postale si
              l&apos;envoi d&apos;un mètre ruban est nécessaire. Les paiements sont traités directement par Stripe.
              SLY Atelier ne reçoit ni ne stocke aucune donnée bancaire.
            </p>
          </section>

          <section>
            <h2 className="text-ink font-medium mb-2">Finalité</h2>
            <p>
              Ces données sont utilisées exclusivement pour préparer le rendez-vous vidéo, produire la pièce
              commandée et assurer la livraison. Elles ne sont jamais vendues, ni transmises à des tiers à des fins
              commerciales ou publicitaires. Elles ne circulent qu&apos;entre les prestataires listés ci-dessous,
              nécessaires au fonctionnement du service.
            </p>
          </section>

          <section>
            <h2 className="text-ink font-medium mb-2">Prestataires tiers</h2>
            <p>
              Le site utilise Calendly (prise de rendez-vous), Stripe (paiement), Resend (notifications par email),
              et un outil de gestion de commandes interne à SLY Atelier (nom, email, configuration choisie et,
              le cas échéant, adresse postale, pour suivre et produire votre commande). Chacun de ces services
              traite les données nécessaires à sa fonction selon sa propre politique de confidentialité ; certains
              (Stripe, Calendly) peuvent héberger des données en dehors de l&apos;Union européenne, avec des garanties
              contractuelles appropriées.
            </p>
          </section>

          <section>
            <h2 className="text-ink font-medium mb-2">Conservation</h2>
            <p>
              Les données sont conservées le temps nécessaire au traitement de la commande et aux obligations
              comptables légales, puis supprimées ou anonymisées.
            </p>
          </section>

          <section>
            <h2 className="text-ink font-medium mb-2">Vos droits</h2>
            <p>
              Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de
              vos données. Pour exercer ces droits, contactez contact@sly-atelier.com.
            </p>
          </section>
        </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
