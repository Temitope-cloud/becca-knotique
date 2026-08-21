"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Scissors,
  ShieldCheck,
  Truck,
} from "lucide-react";
import type { CatalogProduct } from "@/lib/catalog";
import { formatNaira } from "@/lib/money";
import StarRating from "./StarRating";
// v1 CTA used WhatsApp (getWhatsAppLink in @/lib/utils) — now routes to the store.

const DEFAULT_HIGHLIGHTS = [
  { Icon: Scissors, label: "Handmade to order in Nigeria" },
  { Icon: Truck, label: "Priority shipping nationwide" },
  { Icon: ShieldCheck, label: "Secure payment via Paystack" },
];
const ICON_CYCLE = [Scissors, Truck, ShieldCheck];

const OnePiece = ({ product }: { product: CatalogProduct | null }) => {
  const images = product?.images ?? [];
  const [activeImage, setActiveImage] = useState(images[0]);

  if (!product) return null;

  // Use the product's own feature list (set in admin) when available.
  const highlights = product.infos?.length
    ? product.infos.map((info, i) => ({
        Icon: ICON_CYCLE[i % ICON_CYCLE.length],
        label: info.label,
      }))
    : DEFAULT_HIGHLIGHTS;

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(
          ((product.oldPrice - product.price) / product.oldPrice) * 100,
        )
      : null;

  return (
    <section
      id="featured"
      className="w-full scroll-mt-24 px-4 py-16 sm:px-6 md:py-24"
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* header */}
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-stone-400 uppercase">
              Featured piece
            </p>
            <h2 className="font-apparel mt-3 text-4xl leading-none tracking-tight text-stone-900 sm:text-5xl">
              {product.name}
            </h2>
          </div>
          <Link
            href="/products"
            className="group hidden shrink-0 items-center gap-1.5 text-sm font-medium text-stone-500 transition hover:text-stone-900 sm:inline-flex"
          >
            View all
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* editorial two-column */}
        <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-12 lg:gap-16">
          {/* gallery */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-stone-100 md:aspect-auto md:h-[500px] lg:h-[560px]">
              <img
                src={activeImage}
                alt={`${product.name} — product photo`}
                className="h-full w-full object-cover"
              />
              {discount ? (
                <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-stone-900 uppercase backdrop-blur">
                  Save {discount}%
                </span>
              ) : null}
            </div>

            {images.length > 1 ? (
              <ul className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {images.map((img, i) => (
                  <li key={i} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveImage(img)}
                      aria-label={`Show image ${i + 1}`}
                      aria-current={activeImage === img ? true : undefined}
                      className={`block h-20 w-16 overflow-hidden rounded-lg transition sm:h-24 sm:w-20 ${
                        activeImage === img
                          ? "ring-2 ring-stone-900 ring-offset-2"
                          : "opacity-60 hover:opacity-100"
                      }`}
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
            ) : null}
          </div>

          {/* details */}
          <div className="flex flex-col md:py-2">
            {/* tag + rating */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="rounded-full border border-stone-300 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-stone-600 uppercase">
                Limited edition
              </span>
              <div className="flex items-center gap-2 text-sm text-stone-500">
                <StarRating rating={product.stars ?? 5} />
                <span>4.9 · 12 reviews</span>
              </div>
            </div>

            {/* price */}
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
                {formatNaira(product.price)}
              </span>
              {product.oldPrice ? (
                <span className="text-lg text-stone-400 line-through">
                  {formatNaira(product.oldPrice)}
                </span>
              ) : null}
            </div>

            {/* description */}
            <p className="mt-5 max-w-prose text-[15px] leading-relaxed text-stone-600">
              {product.longDescription || product.description}
            </p>

            {/* highlights as hairline list */}
            <ul className="mt-8 divide-y divide-stone-200 border-y border-stone-200">
              {highlights.map(({ Icon, label }) => (
                <li key={label} className="flex items-center gap-3 py-3.5">
                  <Icon
                    className="h-4.5 w-4.5 shrink-0 text-stone-900"
                    strokeWidth={1.6}
                  />
                  <span className="text-sm font-medium text-stone-700">
                    {label}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/products/${product.slug}`}
                className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-stone-900 px-8 py-4 text-sm font-semibold tracking-[0.08em] text-white uppercase transition hover:bg-stone-800"
              >
                Shop this piece
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 px-8 py-4 text-sm font-semibold tracking-[0.08em] text-stone-800 uppercase transition hover:bg-stone-100"
              >
                Request custom
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OnePiece;
