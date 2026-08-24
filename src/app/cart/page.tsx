"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Tag,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatNaira } from "@/lib/money";
import CheckoutSteps from "@/components/CheckoutSteps";

export default function CartPage() {
  const {
    items,
    subtotal,
    total,
    updateQuantity,
    removeItem,
    lineKey,
    hydrated,
    coupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    const res = await applyCoupon(couponInput);
    if (!res.ok) setCouponError(res.reason || "Invalid code.");
    else setCouponInput("");
    setCouponLoading(false);
  }

  if (hydrated && items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
        <ShoppingBag className="h-14 w-14 text-stone-300" />
        <h1 className="mt-6 text-2xl font-semibold text-stone-900">
          Your cart is empty
        </h1>
        <p className="mt-2 text-stone-600">Find something handmade you love.</p>
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
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <CheckoutSteps current={0} />
      <h1 className="mt-8 text-3xl font-semibold tracking-tight text-stone-900">
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
                      {item.customColor ? (
                        <p className="mt-1 text-xs text-stone-500">
                          <span className="font-medium text-stone-700">
                            Custom colour:
                          </span>{" "}
                          {item.customColor}
                        </p>
                      ) : null}
                      {item.measurements?.length ? (
                        <p className="mt-1 text-xs text-stone-500">
                          <span className="font-medium text-stone-700">
                            Measurements:
                          </span>{" "}
                          {item.measurements
                            .map((m) => `${m.label} ${m.value}`)
                            .join(", ")}
                        </p>
                      ) : null}
                      {item.referenceImage ? (
                        <a
                          href={item.referenceImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-block text-xs font-medium text-stone-600 underline underline-offset-2 hover:text-stone-900"
                        >
                          Reference image attached
                        </a>
                      ) : null}
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
                        onClick={() => updateQuantity(key, item.quantity - 1)}
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
                        onClick={() => updateQuantity(key, item.quantity + 1)}
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

        <div className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          {/* coupon */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-stone-500" />
              <h2 className="text-sm font-semibold text-stone-900">
                Coupon code
              </h2>
            </div>

            {coupon ? (
              <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                <span className="flex items-center gap-2 text-sm font-medium text-emerald-800">
                  <Check className="h-4 w-4" />
                  {coupon.code} applied
                </span>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="rounded-md p-1 text-emerald-700 transition hover:bg-emerald-100"
                  aria-label="Remove coupon"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApply} className="mt-3 flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Enter code"
                  className="min-w-0 flex-1 rounded-xl border border-stone-300 px-3 py-2.5 text-sm uppercase text-stone-900 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
                />
                <button
                  type="submit"
                  disabled={couponLoading}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
                >
                  {couponLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Apply
                </button>
              </form>
            )}
            {couponError ? (
              <p className="mt-2 text-xs text-rose-600">{couponError}</p>
            ) : null}
          </div>

          {/* summary */}
          <aside className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
            <h2 className="text-lg font-semibold text-stone-900">
              Order summary
            </h2>
            <div className="mt-4 space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-stone-600">Subtotal</span>
                <span className="font-medium text-stone-900">
                  {formatNaira(subtotal)}
                </span>
              </div>
              {coupon ? (
                <div className="flex items-center justify-between text-[#047857]">
                  <span>Discount ({coupon.code})</span>
                  <span className="font-medium">
                    −{formatNaira(coupon.discount)}
                  </span>
                </div>
              ) : null}
              <div className="flex items-center justify-between text-stone-500">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4">
              <span className="font-medium text-stone-700">Total</span>
              <span className="text-lg font-semibold text-stone-900">
                {formatNaira(total)}
              </span>
            </div>

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
      </div>
    </main>
  );
}
