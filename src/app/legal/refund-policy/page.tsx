import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "Review Becca's Knotique refund terms, return eligibility, cancellation conditions, and refund processing timelines.",
  alternates: {
    canonical: "/legal/refund-policy",
  },
  openGraph: {
    title: "Refund Policy | Becca's Knotique",
    description:
      "Understand return windows, handmade item rules, and refund timelines for Becca's Knotique orders.",
    url: "/legal/refund-policy",
    images: ["/images/about2.png"],
  },
};

const RefundPolicy = () => {
  const highlights = [
    {
      title: "Request Window",
      detail: "Contact us within 7 days of delivery for return support.",
    },
    {
      title: "Handmade Items",
      detail:
        "Because each piece is made by hand, custom orders are non-refundable once production starts.",
    },
    {
      title: "Refund Timeline",
      detail:
        "Approved refunds are processed to your original payment method within 5-10 business days.",
    },
  ];

  const policySections = [
    {
      title: "1. Eligibility for Returns",
      body: "To be eligible for a return, your item must be unused, in its original condition, and returned with any tags or packaging included. Please reach out before sending anything back so we can guide the process.",
    },
    {
      title: "2. Non-Returnable Items",
      body: "Custom-made or personalized pieces cannot be returned unless they arrive damaged or we sent the wrong item. For hygiene reasons, worn accessories are also non-returnable.",
    },
    {
      title: "3. Damaged or Incorrect Orders",
      body: "If your order arrives damaged or incorrect, email us within 48 hours of delivery with your order number and clear photos. We will offer a replacement, store credit, or refund based on the issue.",
    },
    {
      title: "4. Return Shipping",
      body: "Customers are responsible for return shipping costs unless the return is due to our error. We recommend a trackable shipping method, as we are not responsible for lost returns.",
    },
    {
      title: "5. Cancellations",
      body: "Orders may be cancelled within 24 hours of purchase if production has not begun. After this window, handmade production and material prep may already be in progress.",
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
            Refund Policy
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
            We want every Becca&apos;s Knotique order to feel special. If
            something isn&apos;t right, this policy explains when refunds,
            returns, and replacements are possible in a clear and fair way.
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
          <h2 className="text-2xl font-semibold text-gray-900">Need help?</h2>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-gray-700">
            For any return or refund request, include your order number and a
            short description of your concern so we can assist you quickly.
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

export default RefundPolicy;
