import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Defense-in-depth headers. Stripe Checkout is a full-page redirect (no
// Stripe.js/iframe embedded here), so the only third-party surface that
// needs allowing is the Calendly widget on the post-payment success page.
// 'unsafe-eval' is only added outside production — React dev mode uses eval()
// for its debugging features (stack-trace reconstruction, HMR); it never
// does in a production build, so prod stays without it.
const isDev = process.env.NODE_ENV !== "production";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://assets.calendly.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.fal.media",
  "font-src 'self' data:",
  "connect-src 'self' https://calendly.com https://*.calendly.com",
  "frame-src https://calendly.com https://*.calendly.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
