import type { Metadata } from "next";
import ChartPageClient from "./ChartPageClient";

const OG_IMAGE = "/images/about1.png";

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

export default function ProductChartPage() {
  return <ChartPageClient />;
}
