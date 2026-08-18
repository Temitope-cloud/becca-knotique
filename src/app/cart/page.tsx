"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatNaira } from "@/lib/money";

export default function CartPage() {
  const {
    items,
    subtotal,
    updateQuantity,
    removeItem,
    lineKey,
    hydrated,
  } = useCart();

  if (hydrated && items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
        <ShoppingBag className="h-14 w-14 text-stone-300" />
        <h1 className="mt-6 text-2xl font-semibold text-stone-900">
          Your cart is empty
        </h1>
        <p className="mt-2 text-stone-600">
          Find something handmade you love.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          Browse products <ArrowRight className="h-4 w-4" />
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
        Your cart
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <ul className="space-y-4">
          {items.map((item) => {
            const key = lineKey(item);
            return (
              <li
                key={key}
                className="flex gap-4 rounded-2xl border border-stone-200 bg-white p-4"
              >
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : null}
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/products/${item.slug}`}
                        className="line-clamp-2 font-medium text-stone-900 hover:underline"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-stone-500">
                        {[item.size, item.color].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(key)}
                      className="shrink-0 rounded-md p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-rose-600"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="inline-flex items-center rounded-lg border border-stone-300">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(key, item.quantity - 1)
                        }
                        className="px-2.5 py-1.5 text-stone-700 hover:bg-stone-100"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-9 text-center text-sm font-semibold text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(key, item.quantity + 1)
                        }
                        className="px-2.5 py-1.5 text-stone-700 hover:bg-stone-100"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="font-semibold text-stone-900">
                      {formatNaira(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="h-fit rounded-2xl border border-stone-200 bg-stone-50 p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold text-stone-900">
            Order summary
          </h2>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-stone-600">Subtotal</span>
            <span className="font-semibold text-stone-900">
              {formatNaira(subtotal)}
            </span>
          </div>
          <p className="mt-2 text-xs text-stone-500">
            Shipping is arranged after checkout.
          </p>

          <Link
            href="/checkout"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            Proceed to checkout <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/products"
            className="mt-3 block text-center text-sm font-medium text-stone-600 hover:text-stone-900"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </main>
  );
}
