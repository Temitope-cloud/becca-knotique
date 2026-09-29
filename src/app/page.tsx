import CrochetProcess from "@/components/CrochetProcess";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import ShopByCategories from "@/components/ShopByCategories";
import OnePiece from "@/components/OnePiece";
import OurStory from "@/components/OurStory";
import PreFooterCta from "@/components/PreFooterCta";
import { AnimatedTestimonial } from "@/components/Testimonial";
import type { Metadata } from "next";
import { getAllProducts, getFeaturedProduct, getFeaturedProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { cookies } from "next/headers";
import {
  PREFERENCE_COOKIE,
  isPreference,
  sortByPreference,
  heroEyebrowFor,
} from "@/lib/audience";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Becca’s Knotique - Made by Hand, Made for You",
  description:
    "Shop handmade crochet outfits and accessories from Becca's Knotique. Discover unique pieces crafted with care and creativity.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Handmade Crochet Fashion | Becca's Knotique",
    description:
      "Explore handcrafted crochet collections and custom designs by Becca's Knotique.",
    url: "/",
    images: ["https://res.cloudinary.com/u3kraw33/image/upload/v1787262026/beccas-knotique/images/about1.png"],
  },
};

export default async function Home() {
  // Featured products drive both sections: the most recent one is the
  // "Limited Edition" hero, the rest fill the "Just Dropped" grid.
  const featuredList = await getFeaturedProducts(13);
  // Personalize featured ORDER by the shopper's preference (never hides items).
  const cookiePref = (await cookies()).get(PREFERENCE_COOKIE)?.value;
  const preference = isPreference(cookiePref) ? cookiePref : "all";
  const orderedFeatured = sortByPreference(featuredList, preference);
  const hero = orderedFeatured[0] ?? (await getFeaturedProduct());
  const homepageFeature = await getFeaturedProduct();
  const settings = await getSettings();
  const catalogue = await getAllProducts();
  const imageFor = (predicate: (product: (typeof catalogue)[number]) => boolean) =>
    catalogue.find(predicate)?.image;
  const categoryTiles = [
    { name: "New in", href: "/products", image: orderedFeatured[0]?.image ?? hero?.image },
    { name: "Men", href: "/products?for=men", image: imageFor((product) => product.madefor === "men") },
    { name: "Women", href: "/products?for=women", image: imageFor((product) => product.madefor === "women" && product.category !== "accessories") },
    { name: "Accessories", href: "/products?category=accessories", image: imageFor((product) => product.category === "accessories") },
  ];

  return (
    <>
      <HeroSection
        foundedYear={settings.foundedYear}
        eyebrow={heroEyebrowFor(preference)}
        supportEmail={settings.supportEmail}
        address={settings.address}
      />
      <ShopByCategories tiles={categoryTiles} />
      <OurStory />
      <CrochetProcess />
      {/* <AnimatedTestimonial /> */}
      {homepageFeature ? <OnePiece product={homepageFeature} /> : null}
      <PreFooterCta />
      <Footer />
    </>
  );
}
