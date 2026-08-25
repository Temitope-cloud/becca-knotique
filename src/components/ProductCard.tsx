"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ShoppingBag, Check, Star, Heart } from "lucide-react";
import type { CatalogProduct } from "@/lib/catalog";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatNaira } from "@/lib/money";
import Tooltip from "@/components/ui/Tooltip";

function prettyCategory(c: string) {
  return c
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function ProductCard({ product }: { product: CatalogProduct }) {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const [added, setAdded] = useState(false);

  const cover = product.images?.[0] ?? product.image ?? "";
  const hover = product.hoverImage ?? product.images?.[1];
  // Made-to-order pieces are crocheted per order, so they never sell out.
  const soldOut = product.inStock === false && !product.madeToOrder;
  const wished = has(product.slug);
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  function quickAdd() {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: cover,
      price: product.price,
      size: product.sizes?.[0],
      color: product.colors?.[0],
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-38px_rgba(0,0,0,0.4)]">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-3/4 overflow-hidden bg-stone-100"
      >
        {cover ? (
          <>
            <Image
              src={cover}
              alt={product.name}
              fill
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
            />
            {hover ? (
              <Image
                src={hover}
                alt=""
                aria-hidden
                fill
                sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                className="object-cover object-center opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            ) : null}
          </>
        ) : null}

        {discount ? (
          <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold tracking-wide text-stone-900 uppercase backdrop-blur">
            −{discount}%
          </span>
        ) : null}
        {soldOut ? (
          <span
            title="Currently unavailable"
            className="absolute inset-x-0 bottom-0 bg-stone-900/80 py-1.5 text-center text-[11px] font-semibold tracking-wide text-white uppercase"
          >
            Sold out
          </span>
        ) : product.madeToOrder ? (
          <span
            title="We crochet this one just for you after you order."
            className="absolute inset-x-0 bottom-0 bg-emerald-600/85 py-1.5 text-center text-[11px] font-semibold tracking-wide text-white uppercase backdrop-blur"
          >
            Made to order
          </span>
        ) : null}
      </Link>

      {/* wishlist heart */}
      <span className="absolute top-3 right-3">
        <Tooltip label={wished ? "Remove from wishlist" : "Save to wishlist"}>
          <button
            type="button"
            onClick={() => toggle(product.slug)}
            aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
            aria-pressed={wished}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-stone-600 shadow-sm backdrop-blur transition hover:text-rose-600"
          >
            <Heart
              className={`h-4 w-4 ${wished ? "fill-rose-500 text-rose-500" : ""}`}
            />
          </button>
        </Tooltip>
      </span>

      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/products/${product.slug}`}
            className="line-clamp-1 text-sm font-semibold text-stone-900 hover:underline"
          >
            {product.name}
          </Link>
          {product.stars ? (
            <span className="flex shrink-0 items-center gap-0.5 text-xs text-stone-500">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {product.stars}
            </span>
          ) : null}
        </div>

        {product.madefor ? (
          <p className="mt-0.5 text-[11px] tracking-wide text-stone-400 capitalize">
            {product.madefor}
            {product.category ? ` · ${prettyCategory(product.category)}` : ""}
          </p>
        ) : null}

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-semibold text-stone-900">
            {formatNaira(product.price)}
          </span>
          {product.oldPrice ? (
            <span className="text-xs text-stone-400 line-through">
              {formatNaira(product.oldPrice)}
            </span>
          ) : null}
        </div>

        <div className="mt-3.5 flex items-center gap-2">
          <button
            type="button"
            onClick={quickAdd}
            disabled={soldOut}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-stone-900 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {added ? (
              <>
                <Check className="h-3.5 w-3.5" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" /> Add to cart
              </>
            )}
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-stone-300 px-3 py-2.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-100"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
