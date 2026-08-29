import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/customize/success", "/en/customize/success", "/it/customize/success", "/api/"],
      },
    ],
    sitemap: "https://www.sly-atelier.com/sitemap.xml",
  };
}
