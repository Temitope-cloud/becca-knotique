/**
 * Central SEO config. One source of truth for the canonical domain, brand
 * details, and the site-wide structured data (Organization + WebSite).
 */

export const SITE_URL = "https://www.beccasknotique.com";
export const SITE_NAME = "Becca's Knotique";
export const SITE_TAGLINE = "Handmade Crochet Fashion";
export const SITE_DESCRIPTION =
  "Handmade crochet fashion, statement pieces, and made-to-measure custom designs, crafted with care in Nigeria by Becca's Knotique.";

/** Square brand logo (used by Organization structured data). */
export const SITE_LOGO =
  "https://res.cloudinary.com/u3kraw33/image/upload/v1787262022/beccas-knotique/footer-logo.png";

/** Default social share image. */
export const SITE_OG_IMAGE =
  "https://res.cloudinary.com/u3kraw33/image/upload/v1787262026/beccas-knotique/images/about1.png";

/** Public social profiles — feed schema.org `sameAs` for the knowledge graph. */
export const SOCIAL_PROFILES = [
  "https://www.instagram.com/beccasknotique/",
  "https://www.tiktok.com/@beccas_knotique/",
];

export const WHATSAPP_NUMBER = "+2348029086678";

/** Turn a path or possibly-relative URL into an absolute canonical URL. */
export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Organization schema — brand identity, logo, and social profiles. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: SITE_LOGO,
    },
    image: SITE_OG_IMAGE,
    description: SITE_DESCRIPTION,
    email: "beccasknotique@gmail.com",
    sameAs: SOCIAL_PROFILES,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: WHATSAPP_NUMBER,
      areaServed: "NG",
      availableLanguage: ["en"],
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "NG",
    },
  };
}

/** WebSite schema — enables the sitelinks search box in Google results. */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/products?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** BreadcrumbList schema from an ordered list of {name, path}. */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
