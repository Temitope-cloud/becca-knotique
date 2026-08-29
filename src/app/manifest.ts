import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_DESCRIPTION, SITE_LOGO } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Handmade Crochet Fashion`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#059669",
    icons: [
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { src: SITE_LOGO, sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
