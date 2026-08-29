import { defineRouting } from "next-intl/routing";

// French stays unprefixed at the root ("/", "/customize", ...) since that's
// the site's existing, already-indexed URL structure — English and Italian
// get a "/en" / "/it" prefix instead of moving French under "/fr" and
// breaking every backlink and search-indexed URL that exists today.
export const routing = defineRouting({
  locales: ["fr", "en", "it"],
  defaultLocale: "fr",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
