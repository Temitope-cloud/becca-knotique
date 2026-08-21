import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import ParallaxReveal from "@/components/ui/parallaxReveal";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Why I started Becca's Knotique — from a secondary-school table mat and abandoned yarn to earrings, small orders, and a registered handmade crochet brand.",
  alternates: { canonical: "/our-story" },
  openGraph: {
    title: "Why I Started Becca's Knotique",
    description:
      "The honest story behind Becca's Knotique — built one stitch at a time.",
    url: "/our-story",
    images: [
      "https://res.cloudinary.com/u3kraw33/image/upload/v1787262035/beccas-knotique/images/our-story.jpg",
    ],
  },
};

const timeline = [
  { year: "2022", text: "Discovered crochet again" },
  { year: "2023", text: "Bought yarn & abandoned projects" },
  { year: "2024", text: "Started small" },
  { year: "2024+", text: "Becca's Knotique" },
];

export default function OurStoryPage() {
  return (
    <main className="w-full bg-white pb-24">
      {/* hero */}
      <section className="mx-auto w-full max-w-3xl px-5 pt-16 text-center sm:pt-24">
        <p className="text-xs font-semibold tracking-[0.28em] text-emerald-700 uppercase">
          Our Story
        </p>
        <h1 className="font-apparel mt-4 text-4xl leading-[1.05] tracking-tight text-stone-900 sm:text-6xl">
          Why I Started Becca&apos;s Knotique
        </h1>

        <p className="mx-auto mt-8 max-w-2xl border-l-2 border-emerald-500 pl-5 text-left text-xl leading-relaxed font-medium text-stone-700 italic sm:text-2xl">
          “I didn&apos;t actually start Becca&apos;s Knotique in 2022. But 2022
          was the year crochet came back into my life.”
        </p>
      </section>

      {/* hero image */}
      <div className="mx-auto mt-14 w-full max-w-5xl px-5">
        <ParallaxReveal
          className="h-72 w-full rounded-3xl bg-cover bg-center sm:h-[26rem]"
          src="bg-[url('https://res.cloudinary.com/u3kraw33/image/upload/v1787262035/beccas-knotique/images/our-story.jpg')]"
        />
      </div>

      {/* narrative */}
      <article className="mx-auto mt-16 w-full max-w-2xl space-y-6 px-5 text-lg leading-relaxed text-stone-700">
        <p>
          I&apos;ve actually always loved crochet. Back in secondary school —
          we called it knitting then — I made a little table mat with normal
          cotton, and crocheted the edges myself.
        </p>
        <p>
          Then, during NYSC in 2022, I saw people going for SAED training to
          learn crochet. And I remember thinking,{" "}
          <span className="text-stone-900">
            “No, I&apos;m a Computer Science student. I want to focus on tech.
            Crochet is something I can always learn on YouTube later.”
          </span>
        </p>
        <p>
          Fast-forward to after camp. We had about three weeks before resuming
          at our PPAs, and I was just at home doing absolutely nothing. My
          laptop had also stopped working, so I couldn&apos;t really do my tech
          stuff. Then I thought, “You know what? Let me just try this crochet
          thing.”
        </p>
        <p>
          So I went on YouTube. My very first crochet project was a pair of
          shorts. Then I made a bra top for myself. And somehow, I kept coming
          back to crochet — I even made another bra top for my director when I
          started working as a teacher. But then… I stopped again.
        </p>
        <p>
          In 2023, I started working as a banker, and I still had this crochet
          project sitting around. Till today, I haven&apos;t even joined the
          pieces together. And whenever I went to the market, I&apos;d just buy
          yarn. My mum would literally ask me, “All these things you&apos;re
          buying, what are you doing with them?” And honestly… I wasn&apos;t
          doing anything with them. I was just buying yarn and keeping it.
        </p>
        <p>
          Then in 2024, after moving to Ibadan, I started seeing more people
          creating crochet content. And I realised something: my problem was
          that I was always trying to make <em>big</em> projects.
        </p>

        <blockquote className="my-10 border-l-2 border-emerald-500 pl-6">
          <p className="font-apparel text-2xl leading-snug text-stone-900 sm:text-3xl">
            “If you want to become a crocheter, start with small projects.”
          </p>
          <p className="mt-3 text-base text-stone-500">
            And that changed everything.
          </p>
        </blockquote>

        <p>
          I started with earrings. People actually bought them. Then I made
          headbands, started taking small orders, and eventually I thought…
        </p>

        <blockquote className="my-10 border-l-2 border-emerald-500 pl-6">
          <p className="font-apparel text-2xl leading-snug text-stone-900 sm:text-3xl">
            “Wait. I can actually turn this into a business.”
          </p>
        </blockquote>

        <p>
          And that&apos;s how Becca&apos;s Knotique started taking shape. From
          buying random yarn, to earrings, to designing my own logo, packaging,
          stickers and courier bags, registering the business with CAC… and now
          I&apos;m here, building Becca&apos;s Knotique{" "}
          <span className="text-stone-900">one stitch at a time.</span>
        </p>
      </article>

      {/* timeline */}
      <section className="mx-auto mt-20 w-full max-w-5xl px-5">
        <p className="mb-8 text-center text-xs font-semibold tracking-[0.24em] text-stone-400 uppercase">
          The Journey
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {timeline.map((t, i) => (
            <div
              key={t.year}
              className="relative rounded-2xl border border-stone-200 bg-stone-50/70 p-6"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              <p className="font-apparel mt-4 text-2xl text-stone-900">
                {t.year}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-stone-600">
                {t.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ending / CTA */}
      <section className="mx-auto mt-20 w-full max-w-3xl px-5 text-center">
        <p className="font-apparel text-3xl leading-tight text-stone-900 sm:text-4xl">
          So that&apos;s the story behind Becca&apos;s Knotique.
        </p>
        <p className="mx-auto mt-4 max-w-xl text-lg text-stone-600">
          And honestly, I think this is just the beginning.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/products"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-stone-800 sm:w-auto"
          >
            Shop the collection <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-stone-300 px-8 py-3.5 text-sm font-semibold text-stone-800 transition hover:bg-stone-100 sm:w-auto"
          >
            Request a custom piece
          </Link>
        </div>
      </section>
    </main>
  );
}
