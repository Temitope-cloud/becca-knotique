import CrochetProcess from "@/components/CrochetProcess";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import NewCollection from "@/components/NewCollection";
import OnePiece from "@/components/OnePiece";
import OurStory from "@/components/OurStory";
import PreFooterCta from "@/components/PreFooterCta";
import { AnimatedTestimonial } from "@/components/Testimonial";
import type { Metadata } from "next";
import { getFeaturedProduct, getFeaturedProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Becca’s Knotique — Made by Hand, Made for You",
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
  const hero = featuredList[0] ?? (await getFeaturedProduct());
  const gridProducts = featuredList
    .filter((p) => p.id !== hero?.id)
    .slice(0, 12);

  return (
    <>
      <HeroSection />
      {gridProducts.length > 0 ? (
        <NewCollection products={gridProducts} />
      ) : null}
      <OurStory />
      <CrochetProcess />
      {/* <AnimatedTestimonial /> */}
      {hero ? <OnePiece product={hero} /> : null}
      <PreFooterCta />
      <Footer />
    </>
  );
}
