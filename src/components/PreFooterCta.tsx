import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";

const PreFooterCta = () => {
  return (
    <section className="w-full px-4 pb-10 sm:px-6 sm:pb-12 md:pb-14">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl border border-stone-200/80 bg-linear-to-br from-rose-50 via-amber-50 to-white p-7 shadow-[0_24px_70px_-36px_rgba(0,0,0,0.4)] sm:p-9 md:p-12">
          <div
            className="pointer-events-none absolute -top-12 -right-10 h-36 w-36 rounded-full bg-rose-200/40 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-amber-200/40 blur-3xl"
            aria-hidden
          />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-stone-300 bg-white/70 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-stone-600 uppercase">
                Ready for your next piece?
              </span>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-4xl md:text-5xl">
                Let&apos;s create something beautiful together.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-stone-600 sm:text-base">
                Shop ready-to-wear favorites or contact us for a custom crochet
                piece made with your colors, fit, and style in mind.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full border border-stone-900 bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-stone-800"
              >
                Shop now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-100"
              >
                Request custom order
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreFooterCta;
