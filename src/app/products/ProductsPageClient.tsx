"use client";
import Link from "next/link";
import Image from "next/image";
import type { CatalogProduct } from "@/lib/catalog";
import { ArrowRight, BarChart3, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { useRouter } from "next/navigation";

const formatPrice = (value: number) => `₦${value.toLocaleString()}`;

export default function ProductsPageClient({
  products,
}: {
  products: CatalogProduct[];
}) {
  const validProducts = products.filter(
    (product) => product.slug && product.name,
  );

  const categories = Array.from(
    new Set(validProducts.map((product) => product.category).filter(Boolean)),
  );

  const router = useRouter();

  return (
    <main className="relative min-h-screen w-full bg-stone-50 pb-16">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-linear-to-b from-amber-100/55 via-rose-50/35 to-transparent"
        aria-hidden
      />

      <section className="relative mx-auto w-full max-w-7xl px-4 pt-14 sm:px-6 sm:pt-16 md:pt-20">
        <div className="rounded-3xl border border-stone-200/80 bg-white/90 p-8 shadow-[0_25px_80px_-42px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:p-10 md:p-12">
          <p className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-1.5 text-[11px] font-semibold tracking-[0.18em] text-rose-700 uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            Signature collection
          </p>

          <h1 className="mt-6 max-w-4xl text-4xl leading-[1.05] font-semibold tracking-tight text-stone-900 sm:text-5xl md:text-6xl">
            Discover handcrafted crochet pieces designed for timeless style.
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-stone-600 sm:text-base">
            Explore premium, small-batch creations made with careful detail,
            flattering silhouettes, and comfort-first craftsmanship.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/products/chart"
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-stone-100/80 px-4 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-stone-800 uppercase transition hover:border-stone-400 hover:bg-stone-200/60"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Most viewed
            </Link>
            {categories.map((category) => (
              <span
                key={category}
                className="rounded-full border border-stone-200 bg-stone-100/70 px-3 py-1.5 text-xs font-medium tracking-wide text-stone-700 capitalize"
              >
                {category.replace("-", " ")}
              </span>
            ))}
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold tracking-wide text-emerald-700">
              {validProducts.length} products available
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 w-full max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {validProducts.map((product) => {
            const coverImage = product.images?.[0] ?? product.image ?? "";
            const hoverImage = product.hoverImage ?? product.images?.[1];
            const hasDiscount =
              typeof product.oldPrice === "number" &&
              product.oldPrice > product.price;
            const discountPercent = hasDiscount
              ? Math.round(
                  ((product.oldPrice! - product.price) / product.oldPrice!) *
                    100,
                )
              : null;

            return (
              <article
                key={product.slug}
                className="group relative cursor-pointer overflow-hidden rounded-3xl border border-stone-200/80 bg-white p-3 shadow-[0_22px_70px_-42px_rgba(0,0,0,0.5)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_75px_-35px_rgba(0,0,0,0.45)]"
                onClick={() => router.push(`/products/${product.slug}`)}
              >
                <div className="relative aspect-3/4 w-full overflow-hidden rounded-2xl bg-stone-100">
                  {coverImage ? (
                    <>
                      <Image
                        src={coverImage}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />
                      {hoverImage ? (
                        <Image
                          src={hoverImage}
                          alt=""
                          aria-hidden
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-cover object-center opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100"
                        />
                      ) : null}
                    </>
                  ) : (
                    <div className="absolute inset-0 grid place-items-center bg-stone-100 text-sm font-medium text-stone-500">
                      Image coming soon
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-3 px-1 pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold tracking-[0.15em] text-stone-500 uppercase">
                        {product.category.replace("-", " ")}
                      </p>
                      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-stone-900">
                        {product.name}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-stone-600">
                        {product.description ||
                          "Elegant handmade crochet piece."}
                      </p>
                    </div>
                    {discountPercent ? (
                      <span className="shrink-0 rounded-full bg-emerald-700/10 px-3 py-1 text-[11px] font-semibold tracking-wider text-emerald-900 uppercase">
                        -{discountPercent}%
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-baseline gap-3">
                    <p className="text-2xl font-semibold tracking-tight text-stone-900">
                      {formatPrice(product.price)}
                    </p>
                    {product.oldPrice ? (
                      <p className="text-sm text-stone-400 line-through">
                        {formatPrice(product.oldPrice)}
                      </p>
                    ) : null}
                  </div>

                  <Link
                    href={`/products/${product.slug}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold tracking-[0.12em] text-white uppercase transition hover:bg-stone-800"
                  >
                    View details
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-14 w-full max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-stone-200/80 bg-white/90 p-5 shadow-sm sm:grid-cols-3 sm:p-6">
          <div className="flex items-center gap-3 text-sm font-medium text-stone-700">
            <Truck className="h-4 w-4 text-stone-900" />
            Nationwide priority shipping
          </div>
          <div className="flex items-center gap-3 text-sm font-medium text-stone-700">
            <ShieldCheck className="h-4 w-4 text-stone-900" />
            Secure checkout guaranteed
          </div>
          <div className="flex items-center gap-3 text-sm font-medium text-stone-700">
            <Sparkles className="h-4 w-4 text-stone-900" />
            Handmade with premium yarn
          </div>
        </div>
      </section>
    </main>
  );
}
