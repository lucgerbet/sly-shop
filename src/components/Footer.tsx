import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("Footer");

  // These three routes live outside the [locale] segment (see
  // src/app/(legal)) and are never translated, so they use plain next/link
  // rather than the locale-prefixing Link from @/i18n/navigation.
  const legalLinks = [
    { label: t("contact"), href: "mailto:contact@sly-atelier.com" },
    { label: t("legalNotice"), href: "/mentions-legales" },
    { label: t("terms"), href: "/cgv" },
    { label: t("privacyPolicy"), href: "/confidentialite" },
  ];

  return (
    <footer className="border-t border-border bg-white px-6 md:px-10 py-12">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <p className="font-brand text-xl tracking-[0.15em] uppercase text-ink mb-1">
            SLY Atelier
          </p>
          <p className="text-xs text-muted font-light">{t("tagline")}</p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-2">
          {legalLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-xs text-muted hover:text-ink transition-colors tracking-wide"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mx-auto max-w-7xl mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between gap-4">
        <p className="text-xs text-muted font-light">{t("productionNote")}</p>
        <p className="text-xs text-muted font-light shrink-0">
          {t("copyright", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
