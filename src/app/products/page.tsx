import type { Metadata } from "next";
import ProductsPageClient from "./ProductsPageClient";
import { products } from "@/data/Products";

const OG_IMAGE = "/images/about1.png";

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

export default function ProductsPage() {
  const itemListElements = products
    .filter((p) => p.slug && p.name)
    .map((product, index) => ({
      "@type": "ListItem" as const,
      position: index + 1,
      url: `https://www.beccasknotique.com/products/${product.slug}`,
      name: product.name,
    }));

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Becca's Knotique — crochet products",
    description: listingDescription,
    url: "https://www.beccasknotique.com/products",
    numberOfItems: itemListElements.length,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: itemListElements,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionJsonLd),
        }}
      />
      <ProductsPageClient />
    </>
  );
}
