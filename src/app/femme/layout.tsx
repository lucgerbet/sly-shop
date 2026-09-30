import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import Analytics from "@/components/Analytics";
import { cormorant, dmSans } from "@/lib/fonts";
import messages from "../../../messages/fr.json";
import "../globals.css";

// Teaser for the women's universe, French-only for v1 like /bespoke and
// /experience — a hardcoded "fr" root layout rather than [locale]. No
// catalogue/prices exist for women yet (see the bespoke-reproduction
// roadmap's Phase 3), so this stays a lead-capture page until that changes.
export const metadata: Metadata = {
  metadataBase: new URL("https://www.sly-atelier.com"),
  title: { default: "Univers Femme — Bientôt disponible", template: "%s — SLY Atelier" },
};

export default function FemmeLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="bg-white text-ink antialiased">
        <NextIntlClientProvider locale="fr" messages={messages}>
          <Analytics />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
