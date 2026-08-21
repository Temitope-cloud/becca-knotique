"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  ShoppingBag,
  Check,
  BarChart3,
  Search,
  SlidersHorizontal,
  Star,
  ArrowRight,
} from "lucide-react";
import type { CatalogProduct } from "@/lib/catalog";
import { useCart } from "@/context/CartContext";
import { formatNaira } from "@/lib/money";

const GENDERS = [
  { value: "all", label: "All" },
  { value: "women", label: "Women" },
  { value: "men", label: "Men" },
  { value: "unisex", label: "Unisex" },
];

const PRICE_RANGES = [
  { value: "all", label: "All prices", min: 0, max: Infinity },
  { value: "u50", label: "Under ₦50,000", min: 0, max: 50000 },
  { value: "50-100", label: "₦50,000 – ₦100,000", min: 50000, max: 100000 },
  { value: "100-150", label: "₦100,000 – ₦150,000", min: 100000, max: 150000 },
  { value: "o150", label: "Over ₦150,000", min: 150000, max: Infinity },
];

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A–Z" },
];

function prettyCategory(c: string) {
  return c
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/* ---------------- product card ---------------- */

function ProductCard({ product }: { product: CatalogProduct }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const cover = product.images?.[0] ?? product.image ?? "";
  const hover = product.hoverImage ?? product.images?.[1];
  const soldOut = product.inStock === false;
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(
          ((product.oldPrice - product.price) / product.oldPrice) * 100,
        )
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
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-38px_rgba(0,0,0,0.4)]">
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
          <span className="absolute inset-x-0 bottom-0 bg-stone-900/80 py-1.5 text-center text-[11px] font-semibold tracking-wide text-white uppercase">
            Sold out
          </span>
        ) : null}
      </Link>

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

/* ---------------- page ---------------- */

export default function ProductsPageClient({
  products,
}: {
  products: CatalogProduct[];
}) {
  const valid = useMemo(
    () => products.filter((p) => p.slug && p.name && p.active !== false),
    [products],
  );

  const categories = useMemo(
    () =>
      Array.from(new Set(valid.map((p) => p.category).filter(Boolean))) as string[],
    [valid],
  );

  const [gender, setGender] = useState("all");
  const [category, setCategory] = useState("all");
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState("featured");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = [...valid];

    if (gender !== "all") {
      list = list.filter((p) =>
        gender === "unisex"
          ? p.madefor === "unisex"
          : p.madefor === gender || p.madefor === "unisex",
      );
    }
    if (category !== "all") {
      list = list.filter((p) => p.category === category);
    }
    const range = PRICE_RANGES.find((r) => r.value === price);
    if (range && range.value !== "all") {
      list = list.filter((p) => p.price >= range.min && p.price <= range.max);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q)),
      );
    }

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        list.sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return list;
  }, [valid, gender, category, price, sort, query]);

  const activeFilters =
    (gender !== "all" ? 1 : 0) +
    (category !== "all" ? 1 : 0) +
    (price !== "all" ? 1 : 0) +
    (query.trim() ? 1 : 0);

  function clearFilters() {
    setGender("all");
    setCategory("all");
    setPrice("all");
    setQuery("");
  }

  const selectClass =
    "rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 outline-none transition focus:border-stone-900";

  return (
    <main className="min-h-screen w-full bg-stone-50 pb-20">
      {/* header */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-stone-400 uppercase">
              The Collection
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
              Shop all pieces
            </h1>
            <p className="mt-2 max-w-xl text-sm text-stone-600">
              Handmade crochet, made to be worn. Filter by style, size range, or
              budget — add to cart and check out in minutes.
            </p>
          </div>
          <Link
            href="/products/chart"
            className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400"
          >
            <BarChart3 className="h-4 w-4" /> Your stitch chart
          </Link>
        </div>
      </section>

      {/* filter bar */}
      <section className="sticky top-0 z-20 mt-8 border-y border-stone-200 bg-stone-50/90 backdrop-blur">
        <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* gender pills */}
            <div className="flex items-center gap-1 rounded-full border border-stone-200 bg-white p-1">
              {GENDERS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGender(g.value)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    gender === g.value
                      ? "bg-stone-900 text-white"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            {categories.length > 0 ? (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={selectClass}
                aria-label="Category"
              >
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {prettyCategory(c)}
                  </option>
                ))}
              </select>
            ) : null}

            <select
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={selectClass}
              aria-label="Price range"
            >
              {PRICE_RANGES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>

            {/* search grows */}
            <div className="relative min-w-[160px] flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pieces…"
                className="w-full rounded-full border border-stone-300 bg-white py-2 pr-4 pl-9 text-sm text-stone-800 outline-none transition focus:border-stone-900"
              />
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className={selectClass}
              aria-label="Sort"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* results */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-stone-500">
            {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
          </p>
          {activeFilters > 0 ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Clear filters ({activeFilters})
            </button>
          ) : null}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-20 text-center">
            <p className="text-lg font-semibold text-stone-900">
              No pieces match your filters
            </p>
            <p className="mt-1 text-sm text-stone-500">
              Try widening your search or clearing filters.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              Clear filters <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
