import type { Metadata } from "next";
import Analytics from "@/components/Analytics";
import { cormorant, dmSans } from "@/lib/fonts";
import "../globals.css";

// Own root layout (there is no shared one at src/app/layout.tsx — each
// top-level section carries its own, see src/app/experience/layout.tsx).
// French-only and deliberately without NextIntlClientProvider: nothing on
// this page is translated, so there's no reason to ship a message bundle to
// a phone that scanned a QR code. Analytics is the site's cookieless beacon
// (see src/components/Analytics.tsx) — it writes no client-side storage, so
// this page still needs no consent banner.
export const metadata: Metadata = {
  metadataBase: new URL("https://www.sly-atelier.com"),
  robots: { index: false, follow: false },
};

export default function CarteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="bg-white text-ink antialiased">
        <Analytics />
        {children}
      </body>
    </html>
  );
}
