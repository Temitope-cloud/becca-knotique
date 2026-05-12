"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { products, type Product } from "@/data/Products";
import {
  PRODUCT_VIEWS_STORAGE_KEY,
  readProductViews,
} from "@/lib/product-views";
import { cn } from "@/lib/utils";

const validProducts = products.filter((p) => p.slug && p.name);

/** Single accent for bars: depth varies slightly by index so rows stay distinct without rainbow gradients. */
function barToneClass(index: number) {
  const steps = [
    "bg-stone-800",
    "bg-stone-700",
    "bg-stone-800/90",
    "bg-neutral-700",
    "bg-stone-800/85",
    "bg-stone-700/90",
    "bg-neutral-800",
    "bg-stone-700/85",
    "bg-stone-800/80",
    "bg-neutral-700/85",
  ];
  return steps[index % steps.length];
}

function coverFor(p: Product) {
  return p.images?.[0] ?? p.image ?? "";
}

function rankLabel(index: number) {
  return String(index + 1).padStart(2, "0");
}

export default function ChartPageClient() {
  const [views, setViews] = useState<Record<string, number>>({});
  const [mounted, setMounted] = useState(false);

  const refresh = useCallback(() => {
    setViews(readProductViews());
  }, []);

  useEffect(() => {
    setMounted(true);
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === PRODUCT_VIEWS_STORAGE_KEY) refresh();
    };
    const onCustom = () => refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener("bk-product-views-changed", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("bk-product-views-changed", onCustom);
    };
  }, [refresh]);

  const ranked = useMemo(() => {
    const rows = validProducts.map((p) => ({
      product: p,
      count: views[p.slug] ?? 0,
      image: coverFor(p),
    }));
    rows.sort((a, b) => b.count - a.count);
    return rows.slice(0, 10);
  }, [views]);

  const maxCount = useMemo(
    () => Math.max(1, ...ranked.map((r) => r.count)),
    [ranked],
  );

  const totalViews = useMemo(
    () => Object.values(views).reduce((a, n) => a + n, 0),
    [views],
  );

  const hasData = totalViews > 0;

  return (
    <main className="relative min-h-screen w-full bg-stone-50 pb-20">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-linear-to-b from-amber-100/40 via-stone-50/80 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-3xl px-4 pt-12 sm:px-6 sm:pt-16">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-stone-900"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Back to shop
        </Link>

        <header className="mt-10 border-b border-stone-200/90 pb-10">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-stone-500 uppercase">
            On this device
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            Most viewed products
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-600 sm:text-[15px]">
            Counts update when you open a product page. They stay in your
            browser and are not shared with us or other visitors.
          </p>
          {mounted ? (
            <p className="mt-4 text-sm text-stone-500">
              <span className="font-medium text-stone-800 tabular-nums">
                {totalViews}
              </span>{" "}
              {totalViews === 1 ? "view" : "views"} recorded
            </p>
          ) : null}
        </header>

        <section className="mt-10 rounded-2xl border border-stone-200/80 bg-white/90 p-6 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.35)] sm:p-8">
          <h2 className="text-base font-semibold text-stone-900">
            Ranking
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Tap a row to open the product.
          </p>

          {!mounted ? (
            <p className="mt-10 py-4 text-center text-sm text-stone-500">
              Loading…
            </p>
          ) : !hasData ? (
            <div className="mt-8 rounded-xl border border-stone-100 bg-stone-50/80 px-5 py-9 text-center">
              <p className="text-sm font-medium text-stone-800">
                No views yet
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-stone-600">
                Browse the shop and open a few pieces — this list will fill in
                automatically.
              </p>
              <Link
                href="/products"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800"
              >
                View products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <ul className="mt-8 divide-y divide-stone-100">
              {ranked.map((row, index) => {
                const pct = (row.count / maxCount) * 100;
                return (
                  <motion.li
                    key={row.product.slug}
                    className="py-5 first:pt-0"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                  >
                    <Link
                      href={`/products/${row.product.slug}`}
                      className="group block rounded-lg outline-none ring-stone-900/10 focus-visible:ring-2"
                    >
                      <div className="flex items-start gap-4 sm:gap-5">
                        <span
                          className="mt-0.5 w-7 shrink-0 font-mono text-xs font-medium tabular-nums text-stone-400"
                          aria-hidden
                        >
                          {rankLabel(index)}
                        </span>
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-stone-100 sm:h-18 sm:w-18">
                          {row.image ? (
                            <Image
                              src={row.image}
                              alt=""
                              fill
                              className="object-cover transition duration-300 group-hover:scale-[1.02]"
                              sizes="72px"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-stone-300">
                              —
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-stone-900 transition group-hover:text-stone-700">
                            {row.product.name}
                          </p>
                          <p className="mt-0.5 text-xs capitalize text-stone-500">
                            {row.product.category.replace("-", " ")}
                          </p>
                          <div className="mt-3 flex items-center gap-3">
                            <div
                              className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200"
                              role="presentation"
                            >
                              <motion.div
                                className={cn(
                                  "h-full rounded-full",
                                  barToneClass(index),
                                  row.count === 0 && "opacity-30",
                                )}
                                initial={false}
                                animate={{
                                  width: `${Math.max(pct, row.count > 0 ? 6 : 0)}%`,
                                }}
                                transition={{
                                  duration: 0.5,
                                  ease: [0.25, 0.1, 0.25, 1],
                                }}
                              />
                            </div>
                            <span className="w-10 shrink-0 text-right text-sm font-medium tabular-nums text-stone-700">
                              {row.count}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </section>

        <p className="mt-8 text-center text-xs text-stone-500">
          Clears if you delete site data for this shop.
        </p>
      </div>
    </main>
  );
}
