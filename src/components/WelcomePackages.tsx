import Link from "next/link";
import { Gift, ArrowRight } from "lucide-react";
import type { CatalogProduct } from "@/lib/catalog";
import { formatNaira } from "@/lib/money";

export default function WelcomePackages({ products }: { products: CatalogProduct[] }) {
  if (!products.length) return null;
  return (
    <section className="bg-stone-950 px-4 py-16 text-white sm:px-6 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold tracking-[0.14em] uppercase text-stone-200">
            <Gift className="size-3.5" /> Welcome packages
          </span>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">A thoughtful first gift.</h2>
          <p className="mt-4 text-sm leading-relaxed text-stone-300 sm:text-base">
            A small edit of handmade pieces for yourself, a friend, or any moment worth celebrating.
          </p>
        </div>
        <div className="mt-9 grid gap-5 sm:grid-cols-3">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} className="group overflow-hidden rounded-2xl bg-white text-stone-900 transition hover:-translate-y-1">
              <div className="aspect-square overflow-hidden bg-stone-100">
                {product.image ? <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : null}
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="mt-1 text-sm text-stone-500">{formatNaira(product.price)}</p>
                </div>
                <ArrowRight className="size-4 shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
