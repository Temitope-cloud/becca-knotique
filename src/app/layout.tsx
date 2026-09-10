import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import "./styles/custom.css";
import Providers from "@/components/Providers";
import JsonLd from "@/components/JsonLd";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = settings.metaTitle;
  const description = settings.metaDescription;
  const ogImage =
    "https://res.cloudinary.com/u3kraw33/image/upload/v1787262026/beccas-knotique/images/about1.png";
  return {
  metadataBase: new URL("https://www.beccasknotique.com"),
  title: {
    default: title,
    template: `%s | ${settings.storeName}`,
  },
  description,
  applicationName: settings.storeName,
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
    siteName: settings.storeName,
    title,
    description,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Handmade crochet designs by Becca's Knotique",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage],
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  category: "shopping",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <GoogleAnalytics />
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <Providers settings={settings}>{children}</Providers>
      </body>
    </html>
  );
}
