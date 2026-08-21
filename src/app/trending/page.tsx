import Link from "next/link";
import type { Metadata } from "next";
import { Flame, Eye, ArrowRight } from "lucide-react";
import { getBestSellers, getMostViewed } from "@/lib/catalog";
import ProductGrid from "@/components/ProductGrid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trending now",
  description:
    "The most-loved and most-viewed handmade crochet pieces at Becca's Knotique right now.",
  alternates: { canonical: "/trending" },
};

export default async function TrendingPage() {
  const [bestSellers, mostViewed] = await Promise.all([
    getBestSellers(8),
    getMostViewed(8),
  ]);

  const hasAnything = bestSellers.length > 0 || mostViewed.length > 0;

  return (
    <main className="min-h-screen w-full bg-stone-50 pb-20">
      <section className="mx-auto w-full max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16">
        <p className="text-xs font-semibold tracking-[0.24em] text-stone-400 uppercase">
          What everyone&apos;s loving
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
          Trending now
        </h1>
        <p className="mt-2 max-w-xl text-sm text-stone-600">
          Real-time picks — our best sellers and the pieces shoppers are viewing
          most.
        </p>
      </section>

      {!hasAnything ? (
        <section className="mx-auto w-full max-w-7xl px-4 pt-12 sm:px-6">
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-20 text-center">
            <Flame className="h-10 w-10 text-stone-300" />
            <p className="mt-3 text-lg font-semibold text-stone-900">
              Nothing trending yet
            </p>
            <p className="mt-1 text-sm text-stone-500">
              As people shop and browse, the hottest pieces will show up here.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              Shop all pieces <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      ) : (
        <>
          {bestSellers.length > 0 ? (
            <section className="mx-auto w-full max-w-7xl px-4 pt-12 sm:px-6">
              <div className="mb-5 flex items-center gap-2">
                <Flame className="h-5 w-5 text-[#059669]" />
                <h2 className="text-xl font-semibold tracking-tight text-stone-900">
                  Best sellers
                </h2>
              </div>
              <ProductGrid products={bestSellers} />
            </section>
          ) : null}

          {mostViewed.length > 0 ? (
            <section className="mx-auto w-full max-w-7xl px-4 pt-14 sm:px-6">
              <div className="mb-5 flex items-center gap-2">
                <Eye className="h-5 w-5 text-stone-500" />
                <h2 className="text-xl font-semibold tracking-tight text-stone-900">
                  Most viewed
                </h2>
              </div>
              <ProductGrid products={mostViewed} />
            </section>
          ) : null}
        </>
      )}
    </main>
  );
}
