import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "View the terms for using Becca's Knotique, including orders, pricing, shipping, liability, and intellectual property.",
  alternates: {
    canonical: "/legal/terms-of-service",
  },
  openGraph: {
    title: "Terms of Service | Becca's Knotique",
    description:
      "Read the rules and responsibilities for shopping and using the Becca's Knotique website.",
    url: "/legal/terms-of-service",
    images: ["/images/about2.png"],
  },
};

const TermsOfService = () => {
  const highlights = [
    {
      title: "Using Our Website",
      detail:
        "By using our site or placing an order, you agree to these terms and applicable policies.",
    },
    {
      title: "Handmade Products",
      detail:
        "Each item is handmade, so slight variations in color, texture, or finish are part of its uniqueness.",
    },
    {
      title: "Order Responsibility",
      detail:
        "Please provide accurate order and shipping details; we are not liable for delays from incorrect information.",
    },
  ];

  const policySections = [
    {
      title: "1. Acceptance of Terms",
      body: "By accessing this website or purchasing from Becca's Knotique, you agree to follow these Terms of Service. If you do not agree with any part of these terms, please do not use our website or services.",
    },
    {
      title: "2. Products and Availability",
      body: "All products are subject to availability. Because many of our pieces are handmade, production times and stock may vary. We reserve the right to modify or discontinue items without prior notice.",
    },
    {
      title: "3. Pricing and Payments",
      body: "All prices are listed in the currency shown at checkout and may change without notice. Payment must be completed before order processing begins. We reserve the right to cancel or refuse orders if payment issues or suspicious activity are detected.",
    },
    {
      title: "4. Shipping and Delivery",
      body: "Delivery timelines are estimates and may vary due to courier or customs delays. Becca's Knotique is not responsible for delays beyond our control once an order has shipped.",
    },
    {
      title: "5. Returns, Refunds, and Cancellations",
      body: "Returns, refunds, and cancellations are handled according to our Refund Policy. By placing an order, you acknowledge and accept those policy terms.",
    },
    {
      title: "6. Intellectual Property",
      body: "All website content, product photos, branding, and designs are the property of Becca's Knotique unless otherwise stated. You may not copy, reproduce, or use our content for commercial purposes without written permission.",
    },
    {
      title: "7. Limitation of Liability",
      body: "To the fullest extent permitted by law, Becca's Knotique is not liable for indirect, incidental, or consequential damages resulting from use of our website, products, or services.",
    },
    {
      title: "8. Updates to These Terms",
      body: "We may update these Terms of Service at any time. Changes become effective once posted on this page. Continued use of our website after updates means you accept the revised terms.",
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
            Terms of Service
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
            These Terms of Service explain the rules for using Becca&apos;s
            Knotique website and purchasing our products. They are here to keep
            things clear, fair, and transparent for everyone.
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
            If you have questions about these terms, our team can explain how
            they apply to your order or use of our website.
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

export default TermsOfService;