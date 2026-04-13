import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import "./styles/globals.css";
import "./styles/custom.css";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.beccasknotique.com"),
  title: {
    default: "Becca's Knotique | Handmade Crochet Fashion",
    template: "%s | Becca's Knotique",
  },
  description:
    "Discover handmade crochet fashion, statement pieces, and custom designs crafted with care by Becca's Knotique.",
  applicationName: "Becca's Knotique",
  keywords: [
    "Becca's Knotique",
    "crochet fashion",
    "handmade clothing",
    "custom crochet",
    "crochet accessories",
    "Nigeria fashion brand",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.beccasknotique.com",
    siteName: "Becca's Knotique",
    title: "Becca's Knotique | Handmade Crochet Fashion",
    description:
      "Handmade crochet pieces and custom fashion crafted with creativity, quality, and personality.",
    images: [
      {
        url: "/images/about1.png",
        width: 1200,
        height: 630,
        alt: "Handmade crochet designs by Becca's Knotique",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Becca's Knotique | Handmade Crochet Fashion",
    description:
      "Explore handmade crochet fashion and custom statement pieces by Becca's Knotique.",
    images: ["/images/about1.png"],
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* <SmoothScroll /> */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
