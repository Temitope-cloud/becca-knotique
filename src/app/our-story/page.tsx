import React from "react";
import Link from "next/link";
import ParallaxReveal from "@/components/ui/parallaxReveal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Read the full journey of Becca's Knotique, from first stitch to handcrafted collections made to reflect your individuality.",
  alternates: {
    canonical: "/our-story",
  },
  openGraph: {
    title: "Our Story | Becca's Knotique",
    description:
      "See how Becca's Knotique grew into a handcrafted crochet brand rooted in originality and care.",
    url: "/our-story",
    images: ["/images/about1.png"],
  },
};

const OurStoryPage = () => {
  const milestones = [
    {
      year: "2023",
      title: "The First Stitch",
      text: "Becca's Knotique began with a simple idea: create handmade pieces that feel personal, expressive, and unforgettable.",
    },
    {
      year: "2024",
      title: "From Passion to Brand",
      text: "What started as small custom requests grew into a trusted crochet label known for thoughtful details and bold designs.",
    },
    {
      year: "Today",
      title: "Wearable Stories",
      text: "Every piece we make is designed to reflect the person wearing it. No rush, no mass production, just intentional craftsmanship.",
    },
  ];

  const values = [
    {
      title: "Handmade With Intention",
      text: "Each stitch is done by hand, with patience and purpose. We focus on quality over speed, always.",
    },
    {
      title: "Designed Around You",
      text: "From custom colors to fit preferences, we involve you in the process so your piece feels truly yours.",
    },
    {
      title: "Creative, Not Copy-Paste",
      text: "We celebrate originality. Our designs are expressive and made to stand out with confidence.",
    },
  ];

  const process = [
    "Inspiration and sketching based on your preferred vibe.",
    "Yarn and color selection to match your style.",
    "Careful hand-crocheting with quality checks at every stage.",
    "Final finishing, packaging, and delivery with love.",
  ];

  return (
    <main className="bg-linear-to-b from-[#fffbf9] via-white to-[#fff7f3] px-4 pt-12 pb-20 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-3xl border border-[#f1ddd6] bg-white/90 p-8 shadow-sm sm:p-10 lg:p-12">
          <p className="text-sm font-semibold tracking-[0.2em] text-[#a34f3e] uppercase">
            Our Story
          </p>
          <h1 className="font-apparel mt-3 max-w-4xl text-4xl leading-tight font-medium text-gray-900 sm:text-5xl lg:text-6xl">
            We turn yarn into pieces that feel like you.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
            Becca&apos;s Knotique is built on a love for handmade fashion and a
            belief that what you wear should tell your story. Every design is
            crafted to feel beautiful, personal, and made with heart.
          </p>
        </section>

        <ParallaxReveal
          className="mt-8 h-72 w-full rounded-3xl bg-cover bg-center sm:h-96"
          src="bg-[url('/images/about1.png')]"
        />

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <article className="rounded-3xl border border-[#f1ddd6] bg-white p-7 shadow-sm sm:p-8">
            <p className="text-sm font-semibold tracking-[0.15em] text-[#a34f3e] uppercase">
              The Journey
            </p>
            <div className="mt-5 space-y-5">
              {milestones.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[#f5e5df] bg-[#fffaf8] p-5"
                >
                  <p className="text-xs font-semibold tracking-[0.12em] text-[#a34f3e] uppercase">
                    {item.year}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-gray-900">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-base leading-relaxed text-gray-700">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-[#f1ddd6] bg-white p-7 shadow-sm sm:p-8">
            <p className="text-sm font-semibold tracking-[0.15em] text-[#a34f3e] uppercase">
              Why We Do It
            </p>
            <blockquote className="mt-4 border-l-4 border-[#a34f3e] pl-4 text-lg leading-relaxed text-gray-700 sm:text-xl">
              &quot;We don&apos;t just make clothes and accessories. We create
              pieces that carry patience, personality, and confidence.&quot;
            </blockquote>

            <div className="mt-6 space-y-4">
              {values.map((value) => (
                <div key={value.title}>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {value.title}
                  </h3>
                  <p className="mt-1 text-base leading-relaxed text-gray-700">
                    {value.text}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-8 rounded-3xl border border-[#ecd1c9] bg-[#fff3ee] p-7 shadow-sm sm:p-9">
          <p className="text-sm font-semibold tracking-[0.15em] text-[#a34f3e] uppercase">
            Our Craft Process
          </p>
          <ol className="mt-4 grid gap-3 text-base leading-relaxed text-gray-700 sm:grid-cols-2">
            {process.map((step, idx) => (
              <li
                key={step}
                className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#a34f3e] text-xs font-semibold text-white">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#f1ddd6] bg-white p-6 sm:p-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Ready to wear your story?
            </h2>
            <p className="mt-1 text-base text-gray-600">
              Explore our pieces or request a custom order made just for you.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="rounded-full bg-[#a34f3e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8d4334]"
            >
              Shop Collection
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-[#a34f3e] px-5 py-2.5 text-sm font-semibold text-[#a34f3e] transition hover:bg-[#a34f3e] hover:text-white"
            >
              Request Custom
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default OurStoryPage;
