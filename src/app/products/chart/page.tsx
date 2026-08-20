import type { Metadata } from "next";
import ChartPageClient from "./ChartPageClient";
import { getAllProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

const OG_IMAGE = "https://res.cloudinary.com/u3kraw33/image/upload/v1787262026/beccas-knotique/images/about1.png";

const description =
  "Products you have opened most often on this browser, from Becca's Knotique.";

export const metadata: Metadata = {
  title: "Most viewed",
  description,
  keywords: [
    "crochet trending",
    "most viewed products",
    "Becca's Knotique chart",
    "handmade fashion browse",
  ],
  openGraph: {
    title: "Most viewed crochet pieces | Becca's Knotique",
    description,
    url: "/products/chart",
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Becca's Knotique — product chart",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Most viewed crochet pieces | Becca's Knotique",
    description,
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: "/products/chart",
  },
};

export default async function ProductChartPage() {
  const products = await getAllProducts();
  return <ChartPageClient products={products} />;
}
