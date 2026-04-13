import type { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Legal Center",
  description:
    "Access Becca's Knotique legal pages including Privacy Policy, Refund Policy, Terms of Service, and Disclaimer.",
  alternates: {
    canonical: "/legal",
  },
  openGraph: {
    title: "Legal Center | Becca's Knotique",
    description:
      "Browse all Becca's Knotique legal policies and customer protection information.",
    url: "/legal",
    images: ["/images/about2.png"],
  },
};

const legalLinks = [
  {
    title: "Privacy Policy",
    description: "How we collect, use, and protect your personal data.",
    href: "/legal/privacy-policy",
  },
  {
    title: "Refund Policy",
    description: "Return eligibility, cancellations, and refund timelines.",
    href: "/legal/refund-policy",
  },
  {
    title: "Terms of Service",
    description: "Rules and conditions for using our website and services.",
    href: "/legal/terms-of-service",
  },
  {
    title: "Disclaimer",
    description: "Important liability and informational disclaimers.",
    href: "/legal/disclaimer",
  },
];

const LegalPage = () => {
  return (
    <main className="bg-linear-to-b from-[#fff8f5] via-white to-[#fffaf7] px-4 py-14 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-3xl border border-[#f0d8d2] bg-white/90 p-8 shadow-sm sm:p-10">
          <p className="text-sm font-semibold tracking-[0.2em] text-[#a34f3e] uppercase">
            Legal
          </p>
          <h1 className="font-apparel mt-3 text-4xl leading-tight font-medium text-gray-900 sm:text-5xl">
            Legal Center
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
            Find all important policy documents for shopping with Becca&apos;s
            Knotique in one place.
          </p>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          {legalLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-[#f4e3df] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-gray-900">{item.title}</h2>
              <p className="mt-2 text-base leading-relaxed text-gray-600">
                {item.description}
              </p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
};

export default LegalPage;
