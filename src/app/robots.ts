import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private, transactional, and system routes — no SEO value, and we
        // don't want them in the index.
        disallow: [
          "/admin",
          "/api",
          "/account",
          "/cart",
          "/checkout",
          "/order",
          "/login",
          "/signup",
          "/track",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
