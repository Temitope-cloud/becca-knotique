import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const AUDIENCES = [
  { key: "women", label: "Women", href: "/products?for=women" },
  { key: "men", label: "Men", href: "/products?for=men" },
  { key: "unisex", label: "Unisex", href: "/products?for=unisex" },
] as const;

export default function ShopByAudience({
  covers,
}: {
  covers: Record<string, string>;
}) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold tracking-[0.28em] text-emerald-700 uppercase">
          Made for everyone
        </p>
        <h2 className="font-apparel mt-2 text-3xl tracking-tight text-stone-900 sm:text-4xl">
          Who are you shopping for?
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        {AUDIENCES.map((a) => {
          const cover = covers[a.key];
          return (
            <Link
              key={a.key}
              href={a.href}
              className="group relative flex aspect-[4/5] items-end overflow-hidden rounded-3xl bg-stone-200"
            >
              {cover ? (
                <Image
                  src={cover}
                  alt={`Shop ${a.label}`}
                  fill
                  sizes="(max-width:640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-stone-200" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="relative z-10 flex w-full items-center justify-between p-5 sm:p-6">
                <span className="font-apparel text-2xl text-white sm:text-3xl">
                  {a.label}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-stone-900 transition group-hover:bg-white">
                  Shop <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
