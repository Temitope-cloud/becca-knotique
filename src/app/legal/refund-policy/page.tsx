import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Check,
  RefreshCcw,
  X,
  Clock,
  CreditCard,
  Mail,
  Ruler,
} from "lucide-react";

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
    images: [
      "https://res.cloudinary.com/u3kraw33/image/upload/v1787262028/beccas-knotique/images/about2.jpg",
    ],
  },
};

const highlights = [
  {
    Icon: Clock,
    title: "Report quickly",
    detail:
      "Tell us within 48 hours if an item arrives damaged, wrong, or not as described.",
  },
  {
    Icon: Ruler,
    title: "Made-to-order",
    detail:
      "Custom and made-to-measure pieces can't be refunded for a change of mind once we start making them.",
  },
  {
    Icon: RefreshCcw,
    title: "We'll make it right",
    detail:
      "If the fault is ours, you'll get a refund, replacement, or store credit — your choice.",
  },
];

const fullRefund = [
  "Your item arrives damaged or faulty.",
  "You received the wrong item, colour, or size versus what you ordered.",
  "Your order never arrives or is lost in transit.",
  "We can't make your piece (for example we run out of the yarn) — you get a full refund.",
  "The item is significantly not as described.",
];

const storeCredit = [
  "Fit isn't right on a made-to-measure piece you gave measurements for — we'll offer an alteration or a discounted remake.",
  "You changed your mind on a ready-made, unworn item within 7 days — returned in original condition for store credit, or a refund minus delivery.",
];

const noRefund = [
  "Change of mind on a custom or made-to-order piece once production has started (cancel within 24 hours for a full refund).",
  "Worn accessories such as earrings, for hygiene reasons.",
  "Items returned used, washed, or without their original packaging.",
];

const Section = ({
  accent,
  Icon,
  title,
  intro,
  items,
}: {
  accent: "emerald" | "amber" | "rose";
  Icon: React.ElementType;
  title: string;
  intro: string;
  items: string[];
}) => {
  const styles = {
    emerald: {
      border: "border-emerald-200",
      chip: "bg-emerald-100 text-emerald-700",
      dot: "text-emerald-600",
    },
    amber: {
      border: "border-amber-200",
      chip: "bg-amber-100 text-amber-800",
      dot: "text-amber-600",
    },
    rose: {
      border: "border-rose-200",
      chip: "bg-rose-100 text-rose-700",
      dot: "text-rose-500",
    },
  }[accent];

  return (
    <article
      className={`rounded-2xl border ${styles.border} bg-white p-6 shadow-sm sm:p-7`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${styles.chip}`}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
        <h2 className="text-lg font-semibold text-stone-900 sm:text-xl">
          {title}
        </h2>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-stone-600 sm:text-base">
        {intro}
      </p>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm text-stone-700">
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${styles.dot}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
};

const RefundPolicy = () => {
  return (
    <main className="bg-linear-to-b from-emerald-50/60 via-white to-white px-4 py-14 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        {/* hero */}
        <section className="rounded-3xl border border-stone-200 bg-white/90 p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold tracking-[0.22em] text-emerald-700 uppercase">
            Legal
          </p>
          <h1 className="font-apparel mt-3 text-4xl leading-tight text-stone-900 sm:text-5xl">
            Refund & Return Policy
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-stone-600 sm:text-lg">
            Every piece is made by hand, often to your exact measurements. This
            policy explains — in plain language — when we refund, when we offer
            store credit or a remake, and when a sale is final, so you always
            know where you stand.
          </p>
        </section>

        {/* highlights */}
        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          {highlights.map(({ Icon, title, detail }) => (
            <article
              key={title}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <Icon className="h-5 w-5 text-emerald-600" />
              <h2 className="mt-3 font-semibold text-stone-900">{title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
                {detail}
              </p>
            </article>
          ))}
        </section>

        {/* the three clear categories */}
        <section className="mt-6 space-y-4">
          <Section
            accent="emerald"
            Icon={Check}
            title="When you get a full refund"
            intro="If something is wrong on our side, we cover it completely. Email us within 48 hours of delivery with your order number and clear photos."
            items={fullRefund}
          />
          <Section
            accent="amber"
            Icon={RefreshCcw}
            title="Store credit, exchange, or remake"
            intro="For these cases we'll usually offer store credit, an exchange, or a remake rather than a cash refund."
            items={storeCredit}
          />
          <Section
            accent="rose"
            Icon={X}
            title="What can't be refunded"
            intro="Because our pieces are handmade to order and can't simply be re-sold, these are final."
            items={noRefund}
          />
        </section>

        {/* how refunds are paid */}
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-700">
                <CreditCard className="h-4.5 w-4.5" />
              </span>
              <h2 className="text-lg font-semibold text-stone-900">
                How refunds are paid
              </h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              Approved refunds go back to your original payment method through
              Paystack within 5–10 business days, or instantly as store credit
              you can spend on your next order. Store credit is the fastest
              option and never expires.
            </p>
          </article>
          <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-700">
                <Clock className="h-4.5 w-4.5" />
              </span>
              <h2 className="text-lg font-semibold text-stone-900">
                Cancellations & return shipping
              </h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              You can cancel for a full refund within 24 hours of ordering, as
              long as we haven&apos;t started making your piece. For approved
              returns, you cover return shipping unless the fault is ours —
              please use a trackable service.
            </p>
          </article>
        </section>

        {/* contact */}
        <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-stone-900 sm:text-2xl">
            Need help with an order?
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-700 sm:text-base">
            Send your order number and a short description (with photos if it
            arrived damaged or wrong) and we&apos;ll sort it out quickly.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="mailto:beccasknotique@gmail.com"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <Mail className="h-4 w-4" /> Email support
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full border border-emerald-600 px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
            >
              Contact page
            </Link>
            <Link
              href="/track"
              className="inline-flex items-center rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
            >
              Track an order
            </Link>
          </div>
          <p className="mt-5 text-xs text-stone-500">Last updated: September 2026</p>
        </section>
      </div>
    </main>
  );
};

export default RefundPolicy;
