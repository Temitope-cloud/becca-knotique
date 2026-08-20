import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "Read the Becca's Knotique disclaimer covering content accuracy, handmade variations, external links, and liability limits.",
  alternates: {
    canonical: "/legal/disclaimer",
  },
  openGraph: {
    title: "Disclaimer | Becca's Knotique",
    description:
      "Understand the limitations and legal clarifications for using Becca's Knotique content and services.",
    url: "/legal/disclaimer",
    images: ["https://res.cloudinary.com/u3kraw33/image/upload/v1787262028/beccas-knotique/images/about2.jpg"],
  },
};

const DisclaimerPage = () => {
  const highlights = [
    {
      title: "Informational Purpose",
      detail:
        "Content on this site is provided for general information and shopping guidance only.",
    },
    {
      title: "Handmade Variations",
      detail:
        "Because each piece is handmade, slight differences in color, size, or texture can occur naturally.",
    },
    {
      title: "No Guaranteed Outcomes",
      detail:
        "We do our best for accuracy, but we cannot guarantee uninterrupted access or error-free content at all times.",
    },
  ];

  const policySections = [
    {
      title: "1. General Information",
      body: "All information, product descriptions, and content provided on Becca's Knotique are offered in good faith for general informational purposes. While we aim to keep everything accurate and up to date, we make no warranties regarding completeness, reliability, or suitability.",
    },
    {
      title: "2. Product Representation",
      body: "We make every effort to display product colors, textures, and details as accurately as possible. However, due to lighting, screen settings, and handmade craftsmanship, actual products may vary slightly from displayed images.",
    },
    {
      title: "3. Handmade Nature of Items",
      body: "Our pieces are handmade, and small variations are part of their charm and individuality. Minor differences between items do not constitute defects and are not grounds for claims related to misrepresentation.",
    },
    {
      title: "4. External Links and Third Parties",
      body: "Our website may include links to external websites or services. We are not responsible for the content, privacy practices, terms, or reliability of third-party platforms.",
    },
    {
      title: "5. Limitation of Liability",
      body: "By using this website, you agree that Becca's Knotique is not liable for any direct, indirect, incidental, or consequential loss arising from your use of our site, reliance on its content, or inability to access it.",
    },
    {
      title: "6. Professional Advice",
      body: "Nothing on this site constitutes legal, financial, medical, or professional advice. You should seek qualified professional guidance where needed before making decisions based on website content.",
    },
    {
      title: "7. Changes to This Disclaimer",
      body: "We may update this Disclaimer at any time without prior notice. Continued use of our website after changes are posted indicates acceptance of the updated terms.",
    },
  ];

  return (
    <main className="bg-linear-to-b from-[#fff8f5] via-white to-[#fffaf7] px-4 py-14 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-3xl border border-[#f0d8d2] bg-white/90 p-8 shadow-sm sm:p-10">
          <p className="text-sm font-semibold tracking-[0.2em] text-[#a34f3e] uppercase">
            Legal
          </p>
          <h1 className="font-apparel mt-3 text-4xl leading-tight font-medium text-gray-900 sm:text-5xl">
            Disclaimer
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
            This Disclaimer clarifies the limits of information, content
            accuracy, and liability when using Becca&apos;s Knotique website and
            services.
          </p>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-[#f4e3df] bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-gray-900">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">
                {item.detail}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-8 space-y-4">
          {policySections.map((section) => (
            <article
              key={section.title}
              className="rounded-2xl border border-[#f4e3df] bg-white p-6 shadow-sm sm:p-7"
            >
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                {section.title}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-gray-700">
                {section.body}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-[#ecd0c9] bg-[#fff4ef] p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-gray-900">Need clarity?</h2>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-gray-700">
            If anything in this disclaimer is unclear, contact us and we&apos;ll
            be happy to explain.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="mailto:beccasknotique@gmail.com"
              className="rounded-full bg-[#a34f3e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8d4334]"
            >
              Email Support
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-[#a34f3e] px-5 py-2.5 text-sm font-semibold text-[#a34f3e] transition hover:bg-[#a34f3e] hover:text-white"
            >
              Contact Page
            </Link>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Last updated: April 2026
          </p>
        </section>
      </div>
    </main>
  );
};

export default DisclaimerPage;
