import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Everything except: api routes, Next internals, the always-French legal
  // pages (cgv/confidentialite/mentions-legales — never localized, see
  // src/app/(legal)), the always-French "SLY Experience" gift pages
  // (src/app/experience — French-only for v1, same reasoning as the legal
  // pages: not worth a 3-language marketing/checkout page on day one), and
  // any request for a file with an extension (images, sitemap.xml,
  // robots.txt, favicon, etc.).
  matcher: [
    "/((?!api|_next|_vercel|cgv|confidentialite|mentions-legales|experience|.*\\..*).*)",
  ],
};
