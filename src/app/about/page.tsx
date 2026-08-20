import React from "react";
import type { Metadata } from "next";

import ParallaxReveal from "@/components/ui/parallaxReveal";
import { ParallaxImage } from "@/components/ui/ParallexImage";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn the story behind Becca's Knotique, a handmade crochet fashion brand focused on creativity, craftsmanship, and personal style.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Becca's Knotique",
    description:
      "Discover how Becca's Knotique transforms yarn into wearable art with heart and detail.",
    url: "/about",
    images: ["https://res.cloudinary.com/u3kraw33/image/upload/v1787262028/beccas-knotique/images/about2.jpg"],
  },
};

const AboutUs = () => {
  const about = [
    {
      title: "Intro",
      des: "Becca’s Knotique was born from a love for creating pieces that feel as special as the people who wear them. What started as a simple passion for crochet has grown into a brand dedicated to handmade fashion that stands out.",
    },
    {
      title: "The Story",
      des: "Founded in 2023, Becca’s Knotique began with a vision — to turn yarn into wearable art. Every stitch, pattern, and design is carefully crafted, not just to look good, but to feel personal.",
      sub: "From scrunchies and accessories to full statement outfits, each piece tells a story of patience, creativity, and attention to detail.",
    },
    {
      title: "What Makes Us Different",
      des: "We don’t believe in mass production. Every item is handmade with care, which means no two pieces are exactly the same.",
      sub: "Whether it’s a custom order or a ready-to-wear design, our goal is simple — to create something that feels uniquely yours.",
    },
    {
      title: "The Experience",
      des: "At Becca’s Knotique, you’re not just buying a product — you’re part of the process. From choosing colors to final delivery, we make sure every piece reflects your style and personality.",
    },
  ];
  return (
    <>
      <div className="mb-10 px-4">
        <div className="mx-auto mt-10 max-w-5xl px-4 sm:px-8">
          <p className="mb-2 text-sm font-semibold tracking-[0.22em] text-[#a34f3e] uppercase">
            Our Story
          </p>
          <h1 className="font-apparel text-4xl leading-tight font-medium text-gray-900 sm:text-5xl lg:text-6xl">
            About Becca&apos;s Knotique
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
            Handmade with heart, designed to feel personal, and crafted to stand
            out beautifully.
          </p>
        </div>

        <ParallaxReveal
          className="my-10 h-80 w-full rounded bg-cover bg-top"
          src="bg-[url('https://res.cloudinary.com/u3kraw33/image/upload/v1787262026/beccas-knotique/images/about1.png')]"
        />

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-5">
            {about.map((a, i) => (
              <div
                key={a.title}
                className="group rounded-2xl border bg-white/80 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-700/10"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold">
                    {i + 1}
                  </span>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 lg:text-3xl">
                    {a.title}
                  </h1>
                </div>
                <p className="text-base leading-relaxed text-gray-700 lg:text-lg">
                  {a.des}
                </p>
                {a.sub && (
                  <p className="mt-3 border-l-4 border-[#a34f3e] pl-4 text-base leading-relaxed text-gray-600 lg:text-lg">
                    {a.sub}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="hidden rounded-2xl bg-linear-to-b lg:block">
            <img
              src="https://res.cloudinary.com/u3kraw33/image/upload/v1787262028/beccas-knotique/images/about2.jpg"
              alt="About Us"
              className="h-full rounded-xl object-cover"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutUs;
