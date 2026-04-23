import CrochetProcess from "@/components/CrochetProcess";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import NewCollection from "@/components/NewCollection";
import OnePiece from "@/components/OnePiece";
import OurStory from "@/components/OurStory";
import PreFooterCta from "@/components/PreFooterCta";
import { AnimatedTestimonial } from "@/components/Testimonial";
import Image from "next/image";
import type { Metadata } from "next";

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
    images: ["/images/about1.png"],
  },
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <NewCollection />
      <OurStory />
      <CrochetProcess />
      {/* <AnimatedTestimonial /> */}
      <OnePiece />
      <PreFooterCta />
      <Footer />
    </>
  );
}
