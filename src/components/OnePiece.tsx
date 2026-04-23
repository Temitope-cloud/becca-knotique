"use client";
import { onePiece } from "@/data/Products";
import React, { useState } from "react";
import { Clock3, ShieldCheck, Sparkles, Truck } from "lucide-react";
import StarRating from "./StarRating";
import DiscountTimer from "./ui/DiscountTimer";

const OnePiece = () => {
  const product = onePiece[0];
  const images = product.imgs;
  const [activeImage, setActiveImage] = useState(images[0]);
  return (
    <>
      <section
        id="featured"
        className="w-full scroll-mt-24 px-3 py-8 sm:px-4 md:py-12"
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 md:flex-row md:items-stretch md:gap-10 lg:gap-12">
          {/* Gallery: aspect box on mobile (scrollable page); stretches with details on md+ */}
          <div className="relative aspect-3/4 w-full shrink-0 overflow-hidden rounded-xl bg-neutral-200 max-md:mx-auto max-md:max-w-lg md:mx-0 md:aspect-auto md:min-h-[min(28rem,70vh)] md:max-w-none md:flex-1">
            <div className="pointer-events-none absolute inset-0 z-10 rounded-xl bg-linear-to-t from-black via-black/10 to-transparent" />
            <img
              src={activeImage}
              alt={`${product.name} — product photo`}
              className="h-full w-full object-cover md:absolute md:inset-0"
            />

            <div className="absolute inset-x-0 bottom-0 z-20 px-2 pt-10 pb-3 sm:px-3 sm:pb-4">
              <ul
                className="-mx-1 flex touch-pan-x list-none flex-col gap-2 overflow-x-auto overflow-y-hidden px-1 pb-1 [scrollbar-width:thin] max-md:snap-x max-md:snap-mandatory sm:justify-center sm:gap-3 md:mx-0 md:flex-wrap md:justify-center md:overflow-x-visible md:px-0"
                aria-label="Product gallery thumbnails"
              >
                {images.map((img, i) => (
                  <li
                    key={i}
                    className="shrink-0 max-md:snap-center md:snap-align-none"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className={`block h-16 w-16 cursor-pointer overflow-hidden rounded-md border-2 transition-all duration-300 sm:h-19 sm:w-19 md:h-24 md:w-24 ${
                        activeImage !== img
                          ? "border-transparent opacity-55 hover:border-white/80 hover:opacity-80"
                          : "border-white opacity-100 ring-2 ring-white/40"
                      }`}
                      aria-label={`Show image ${i + 1}`}
                      aria-current={activeImage === img ? true : undefined}
                    >
                      <img
                        src={img}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex w-full min-w-0 flex-1 flex-col md:max-w-xl md:py-0 lg:max-w-none lg:flex-[1.1]">
            <div className="flex flex-col gap-4 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
                Custom Order{" "}
              </p>
            </div>

            {onePiece.map((piece, idx) => (
              <div
                key={`${piece.name}-${idx}`}
                className="mt-7 rounded-3xl border border-stone-200/90 bg-linear-to-br from-stone-50/95 via-white to-amber-50/30 p-6 shadow-[0_1px_0_rgba(0,0,0,0.04),0_18px_55px_-18px_rgba(0,0,0,0.18)] ring-1 ring-black/3 sm:p-8"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-rose-700 uppercase">
                    <Sparkles className="h-3.5 w-3.5" />
                    Limited Edition
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-amber-800 uppercase">
                    <Clock3 className="h-3.5 w-3.5" />
                    Fast selling
                  </span>
                </div>

                <p className="font-apparel text-5xl leading-[1.15] tracking-tight text-neutral-900">
                  {piece.name}
                </p>

                <DiscountTimer
                  endTime={new Date(Date.now() + 1000 * 60 * 60 * 24)}
                  title="Private sale ends in"
                  expiredText="This offer has closed"
                  className="mt-4"
                />

                <div className="mt-4 rounded-2xl border border-rose-200/70 bg-rose-50/70 px-4 py-3">
                  <p className="text-sm font-semibold text-rose-800">
                    Only <span className="text-base">7 pieces</span> left at
                    this price.
                  </p>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-rose-100">
                    <div className="h-full w-[78%] rounded-full bg-rose-500" />
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-2">
                  <p className="text-4xl font-semibold tracking-tight text-neutral-900">
                    {piece.currentPrice}
                  </p>
                  <p className="text-lg text-stone-600 line-through decoration-stone-300">
                    {piece.oldPrice}
                  </p>
                  <span className="rounded-full bg-emerald-700/10 px-3 py-1 text-xs font-semibold tracking-widest text-emerald-900 uppercase">
                    Save 30%
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3 border-b border-stone-200/80 pb-6">
                  <div className="flex items-center gap-2 rounded-full bg-amber-50/90 px-3 py-1.5 ring-1 ring-amber-200/60">
                    <StarRating rating={piece.stars} />
                  </div>
                  <p className="text-sm text-stone-600">
                    <span className="font-semibold text-stone-800">12</span>{" "}
                    verified reviews
                  </p>
                  <p className="text-sm text-stone-600">
                    <span className="font-semibold text-stone-800">4.9/5</span>{" "}
                    customer satisfaction
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {piece.infos.map((info, infoIdx) => {
                    const Icon = info.icon;
                    return (
                      <div
                        key={infoIdx}
                        className="flex items-center gap-3 rounded-xl border border-stone-100/90 bg-white/90 px-3 py-3.5 shadow-sm backdrop-blur-sm transition hover:border-stone-200 hover:shadow-md"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white shadow-inner">
                          <Icon className="h-4 w-full" strokeWidth={1.75} />
                        </span>
                        <p className="text-sm leading-snug font-medium text-neutral-700">
                          {info.label}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="mt-6 w-full cursor-pointer rounded-xl bg-neutral-900 px-8 py-4 text-base font-semibold tracking-[0.2em] text-white uppercase shadow-lg shadow-neutral-900/25 transition hover:bg-neutral-800 hover:shadow-xl active:scale-[0.99]"
                >
                  Secure yours now
                </button>
                <p className="mt-3 text-center text-xs tracking-[0.08em] text-stone-500 uppercase">
                  Checkout in under 1 minute
                </p>

                <div className="mt-5 grid grid-cols-1 gap-3 rounded-2xl border border-stone-200/80 bg-white/75 p-4 sm:grid-cols-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
                    <Truck className="h-4 w-4 text-stone-900" />
                    Priority shipping
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
                    <ShieldCheck className="h-4 w-4 text-stone-900" />
                    Secure payment
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
                    <Sparkles className="h-4 w-4 text-stone-900" />
                    Handmade quality
                  </div>
                </div>

                <div className="mt-10 rounded-xl border border-stone-100 bg-white/70 p-5 sm:p-6">
                  <p className="text-base font-semibold tracking-[0.12em] text-neutral-800 uppercase sm:text-lg">
                    Description
                  </p>
                  <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
                    {piece.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default OnePiece;
