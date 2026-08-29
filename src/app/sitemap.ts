import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const BASE_URL = "https://www.sly-atelier.com";

// French is unprefixed (default locale, "as-needed" prefix strategy);
// English and Italian live under /en and /it.
function localizedPath(locale: string, path: string): string {
  return locale === routing.defaultLocale ? path || "/" : `/${locale}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const localizedRoutes = ["", "/customize", "/notre-histoire"];
  const legalRoutes = ["/cgv", "/confidentialite", "/mentions-legales"];

  const localizedEntries = localizedRoutes.map((route) => ({
    url: `${BASE_URL}${localizedPath(routing.defaultLocale, route)}`,
    lastModified: new Date(),
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [locale, `${BASE_URL}${localizedPath(locale, route)}`])
      ),
    },
  }));

  // Legal pages live outside the [locale] segment — always French, no
  // per-language alternates.
  const legalEntries = legalRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }));

  return [...localizedEntries, ...legalEntries];
}
