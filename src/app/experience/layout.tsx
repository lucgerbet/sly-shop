import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import Analytics from "@/components/Analytics";
import { cormorant, dmSans } from "@/lib/fonts";
import messages from "../../../messages/fr.json";
import "../globals.css";

// "The SLY Experience" gift pages are French-only for v1 (same reasoning as
// src/app/(legal)) — a hardcoded "fr" root layout rather than a [locale] one.
export const metadata: Metadata = {
  metadataBase: new URL("https://www.sly-atelier.com"),
  title: { default: "SLY Experience — Offrez une création sur mesure", template: "%s — SLY Atelier" },
};

export default function ExperienceLayout({ children }: { children: React.ReactNode }) {
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
