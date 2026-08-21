import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Home, ShoppingBag, PackageSearch } from "lucide-react";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page slipped a stitch. Let's get you back on track.",
  robots: { index: false, follow: false },
};

const links = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/products", label: "Shop all pieces", Icon: ShoppingBag },
  { href: "/track", label: "Track an order", Icon: PackageSearch },
];

export default function NotFound() {
  return (
    <main className="relative flex min-h-[85vh] w-full flex-col items-center justify-center overflow-hidden bg-stone-50 px-6 py-20 text-center">
      {/* soft emerald wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-linear-to-b from-emerald-100/50 via-emerald-50/25 to-transparent"
      />

      <div className="relative">
        <p className="font-apparel leading-none tracking-tight text-stone-900">
          <span
            className="block bg-linear-to-b from-stone-900 to-stone-500 bg-clip-text text-transparent"
            style={{ fontSize: "clamp(5rem, 22vw, 12rem)" }}
          >
            404
          </span>
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
          This page slipped a stitch
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-600 sm:text-base">
          The page you&apos;re looking for isn&apos;t here — it may have moved, or
          the link was unravelled. Let&apos;s get you back to something beautiful.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/products"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-stone-800 sm:w-auto"
          >
            Continue shopping <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-stone-300 px-7 py-3.5 text-sm font-semibold text-stone-800 transition hover:bg-stone-100 sm:w-auto"
          >
            Back home
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {links.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition hover:text-emerald-700"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
