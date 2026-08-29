import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Votre carte SLY Experience",
  robots: { index: false, follow: false },
};

type GiftCardInfo =
  | { valid: true; packKey: string; packLabel: string; priceCents: number; beneficiaryName: string; giftMessage: string; buyerFirstName: string; expiresAt: string }
  | { valid: false; reason: string };

async function fetchGiftCard(code: string): Promise<GiftCardInfo> {
  const crmUrl = process.env.SLY_CRM_URL;
  const intakeSecret = process.env.SLY_INTAKE_SECRET;
  if (!crmUrl || !intakeSecret) return { valid: false, reason: "not_configured" };

  try {
    const res = await fetch(`${crmUrl}/api/gift-cards/${encodeURIComponent(code)}`, {
      headers: { Authorization: `Bearer ${intakeSecret}` },
      cache: "no-store",
    });
    return await res.json();
  } catch {
    return { valid: false, reason: "error" };
  }
}

const REASON_MESSAGES: Record<string, string> = {
  not_found: "Ce code n'est pas reconnu. Vérifiez le lien ou le QR code, ou contactez la personne qui vous l'a offert.",
  expired: "Cette carte cadeau a expiré. Contactez-nous si vous pensez qu'il s'agit d'une erreur.",
  redeemed: "Cette carte cadeau a déjà été utilisée.",
  not_configured: "Ce service est momentanément indisponible, réessayez plus tard.",
  error: "Une erreur est survenue, réessayez plus tard.",
};

export default async function GiftCardPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const card = await fetchGiftCard(code);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[70px] flex items-center justify-center px-6 py-16">
        {card.valid ? (
          <div className="max-w-lg w-full text-center">
            <p className="text-[11px] uppercase tracking-[0.35em] text-choco mb-6 font-medium">SLY Experience</p>
            <h1 className="font-brand text-4xl md:text-5xl text-ink mb-6">
              {card.beneficiaryName ? `Pour ${card.beneficiaryName}` : "Un cadeau pour vous"}
            </h1>
            {card.giftMessage && (
              <p className="text-base text-muted font-light italic leading-relaxed mb-8 border-l-2 border-choco pl-4 text-left">
                &ldquo;{card.giftMessage}&rdquo;
              </p>
            )}
            <div className="border border-border px-8 py-8 mb-8">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2">Votre pack</p>
              <p className="font-brand text-2xl text-ink mb-4">{card.packLabel}</p>
              <p className="text-sm text-muted font-light leading-relaxed">
                Choisissez votre style et réservez votre rendez-vous vidéo avec Luc — tout est déjà réglé,
                il ne vous reste plus rien à payer.
              </p>
            </div>
            <Link
              href={`/customize?type=suit&giftCode=${encodeURIComponent(code)}`}
              className="inline-flex items-center justify-center px-8 py-4 bg-choco text-white text-sm tracking-wide hover:bg-ink transition-colors w-full"
            >
              Commencer ma sélection →
            </Link>
            <p className="text-xs text-muted font-light mt-4">
              Valable jusqu&apos;au {new Date(card.expiresAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}.
            </p>
          </div>
        ) : (
          <div className="max-w-md text-center">
            <h1 className="font-brand text-3xl text-ink mb-4">Carte cadeau introuvable</h1>
            <p className="text-sm text-muted font-light leading-relaxed mb-8">
              {REASON_MESSAGES[card.reason] || REASON_MESSAGES.error}
            </p>
            <Link href="/" className="text-sm text-ink border-b border-ink pb-1 hover:text-choco hover:border-choco transition-colors">
              Retour à l&apos;accueil
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
