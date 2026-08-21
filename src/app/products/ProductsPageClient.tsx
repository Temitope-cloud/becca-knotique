"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Search,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react";
import type { CatalogProduct } from "@/lib/catalog";
import ProductCard from "@/components/ProductCard";
import { readProductViews } from "@/lib/product-views";
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

/* ---------------- recently viewed rail ---------------- */

function RecentlyViewed({ products }: { products: CatalogProduct[] }) {
  const [recent, setRecent] = useState<CatalogProduct[]>([]);

  useEffect(() => {
    const views = readProductViews();
    const bySlug = new Map(products.map((p) => [p.slug, p]));
    const ranked = Object.entries(views)
      .sort((a, b) => b[1] - a[1])
      .map(([slug]) => bySlug.get(slug))
      .filter(Boolean) as CatalogProduct[];
    setRecent(ranked.slice(0, 8));
  }, [products]);

  if (recent.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6">
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-stone-500 uppercase">
        Recently viewed
      </h2>
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        {recent.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            className="group w-36 shrink-0"
          >
            <div className="relative aspect-3/4 overflow-hidden rounded-xl bg-stone-100">
              {(p.images?.[0] ?? p.image) ? (
                <Image
                  src={p.images?.[0] ?? p.image ?? ""}
                  alt={p.name}
                  fill
                  sizes="144px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : null}
            </div>
            <p className="mt-2 line-clamp-1 text-xs font-medium text-stone-800">
              {p.name}
            </p>
            <p className="text-xs text-stone-500">{formatNaira(p.price)}</p>
          </Link>
        ))}
      </div>
    </section>
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
      Array.from(
        new Set(valid.map((p) => p.category).filter(Boolean)),
      ) as string[],
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
            href="/trending"
            className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400"
          >
            <BarChart3 className="h-4 w-4" /> Trending now
          </Link>
        </div>
      </section>

      {/* filter bar */}
      <section className="sticky top-0 z-20 mt-8 border-y border-stone-200 bg-stone-50/90 backdrop-blur">
        <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-2.5">
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

      <RecentlyViewed products={valid} />
    </main>
  );
}
