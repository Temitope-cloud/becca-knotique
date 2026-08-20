import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read how Becca's Knotique collects, uses, and protects your personal information and privacy rights.",
  alternates: {
    canonical: "/legal/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy | Becca's Knotique",
    description:
      "Learn what data we collect, why we collect it, and how your privacy is protected.",
    url: "/legal/privacy-policy",
    images: ["https://res.cloudinary.com/u3kraw33/image/upload/v1787262028/beccas-knotique/images/about2.jpg"],
  },
};

const PrivacyPolicy = () => {
  const highlights = [
    {
      title: "Data We Collect",
      detail:
        "Basic details like your name, email, phone number, shipping address, and order information.",
    },
    {
      title: "How We Use It",
      detail:
        "To process orders, provide customer support, improve our services, and share important updates.",
    },
    {
      title: "Your Control",
      detail:
        "You can request to review, correct, or delete your personal information at any time.",
    },
  ];

  const policySections = [
    {
      title: "1. Information We Collect",
      body: "When you place an order or contact us, we may collect your name, email address, phone number, shipping/billing address, and purchase details. We may also collect basic device or browser information to improve site performance.",
    },
    {
      title: "2. How We Use Your Information",
      body: "Your information is used to fulfill orders, process payments, communicate order updates, respond to inquiries, and improve your shopping experience. We only use personal data for legitimate business purposes related to Becca's Knotique services.",
    },
    {
      title: "3. Sharing Your Information",
      body: "We do not sell or rent your personal data. We may share necessary information with trusted service providers such as payment processors, delivery partners, and tools that help us run our store efficiently.",
    },
    {
      title: "4. Data Security",
      body: "We take reasonable technical and organizational steps to protect your information from unauthorized access, misuse, or disclosure. While no online system is 100% risk-free, we continually work to keep your data secure.",
    },
    {
      title: "5. Cookies and Analytics",
      body: "Our website may use cookies and analytics tools to understand user behavior, remember preferences, and improve performance. You can manage cookie settings through your browser at any time.",
    },
    {
      title: "6. Your Rights",
      body: "You may request access to your personal information, ask for corrections, or request deletion where applicable. To make a request, contact us through the email below and we will respond as soon as possible.",
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
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
            Your trust matters to us. This Privacy Policy explains what data we
            collect, how we use it, and the choices you have while shopping with
            Becca&apos;s Knotique.
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
          <h2 className="text-2xl font-semibold text-gray-900">Questions?</h2>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-gray-700">
            If you have privacy questions or want to request access, correction,
            or deletion of your data, contact us and we&apos;ll assist you.
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

export default PrivacyPolicy;
