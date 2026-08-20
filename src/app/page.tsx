import CrochetProcess from "@/components/CrochetProcess";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import NewCollection from "@/components/NewCollection";
import OnePiece from "@/components/OnePiece";
import OurStory from "@/components/OurStory";
import PreFooterCta from "@/components/PreFooterCta";
import { AnimatedTestimonial } from "@/components/Testimonial";
import type { Metadata } from "next";
import { getFeaturedProduct, getProductsByCategory } from "@/lib/catalog";

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
  const [featured, newCollection] = await Promise.all([
    getFeaturedProduct(),
    getProductsByCategory("new-collection"),
  ]);

  return (
    <>
      <HeroSection />
      <NewCollection products={newCollection} />
      <OurStory />
      <CrochetProcess />
      {/* <AnimatedTestimonial /> */}
      <OnePiece product={featured} />
      <PreFooterCta />
      <Footer />
    </>
  );
}
