"use client";

import { usePathname as useRawPathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LOCALE_LABELS: Record<string, string> = {
  fr: "FR",
  en: "EN",
  it: "IT",
};

// Legal pages (/cgv, /confidentialite, /mentions-legales) and the "SLY
// Experience" gift pages (/experience/*) all live outside the [locale]
// segment entirely — always French, no translated equivalent to switch to
// (see src/app/(legal) and src/app/experience). next-intl's own routing
// helpers don't know these routes, so switching from there would 404; the
// raw pathname lets us detect that case and just not render a switcher.
// Prefix match (not exact) since /experience has nested routes of its own
// (/experience/carte/[code], /experience/success).
const LOCALE_AGNOSTIC_PREFIXES = ["/cgv", "/confidentialite", "/mentions-legales", "/experience"];

export default function LangSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const rawPathname = useRawPathname();
  const router = useRouter();
  const t = useTranslations("LangSwitcher");

  if (LOCALE_AGNOSTIC_PREFIXES.some((p) => rawPathname === p || rawPathname.startsWith(`${p}/`))) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 ${className}`} aria-label={t("label")}>
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() => router.replace(pathname, { locale: l })}
          className={`px-2 py-1 text-[11px] tracking-wide transition-colors ${
            l === locale ? "text-ink font-medium" : "text-muted hover:text-ink"
          }`}
          aria-current={l === locale ? "true" : undefined}
        >
          {LOCALE_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
