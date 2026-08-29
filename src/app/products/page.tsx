import type { Metadata } from "next";
import ProductsPageClient from "./ProductsPageClient";
import { getAllProducts } from "@/lib/catalog";
import { SITE_URL, breadcrumbSchema } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

export const dynamic = "force-dynamic";

const OG_IMAGE = "https://res.cloudinary.com/u3kraw33/image/upload/v1787262026/beccas-knotique/images/about1.png";

const listingDescription =
  "Shop handmade crochet dresses, sets, accessories, and bags from Becca's Knotique — premium small-batch pieces with nationwide shipping in Nigeria.";

export const metadata: Metadata = {
  title: "Shop crochet products",
  description: listingDescription,
  keywords: [
    "shop crochet",
    "handmade crochet Nigeria",
    "crochet dresses",
    "crochet fashion",
    "Becca's Knotique shop",
  ],
  openGraph: {
    title: "Shop handmade crochet | Becca's Knotique",
    description: listingDescription,
    url: "/products",
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Handmade crochet collection by Becca's Knotique",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop handmade crochet | Becca's Knotique",
    description: listingDescription,
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: "/products",
  },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const products = await getAllProducts();
  const itemListElements = products
    .filter((p) => p.slug && p.name)
    .map((product, index) => ({
      "@type": "ListItem" as const,
      position: index + 1,
      url: `${SITE_URL}/products/${product.slug}`,
      name: product.name,
    }));

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Becca's Knotique — crochet products",
    description: listingDescription,
    url: `${SITE_URL}/products`,
    numberOfItems: itemListElements.length,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: itemListElements,
    },
  };

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
  ]);

  return (
    <>
      <JsonLd data={collectionJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <ProductsPageClient products={products} initialQuery={q ?? ""} />
    </>
  );
}
