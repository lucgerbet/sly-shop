import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import Analytics from "@/components/Analytics";
import { cormorant, dmSans } from "@/lib/fonts";
import messages from "../../../messages/fr.json";
import "../globals.css";

// Legal pages (CGV, mentions légales, confidentialité) are never translated —
// the French entity and French law apply regardless of the visitor's
// language, so this root layout is deliberately hardcoded to "fr" rather
// than reading a [locale] param.
export const metadata: Metadata = {
  metadataBase: new URL("https://www.sly-atelier.com"),
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
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
