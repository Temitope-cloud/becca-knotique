"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Loader2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatNaira } from "@/lib/money";
import CheckoutSteps from "@/components/CheckoutSteps";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, subtotal, hydrated, coupon } = useCart();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    note: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shippingCfg, setShippingCfg] = useState({ fee: 0, threshold: 0 });

  useEffect(() => {
    fetch("/api/store-settings")
      .then((r) => r.json())
      .then((d) =>
        setShippingCfg({
          fee: Number(d.shippingFee) || 0,
          threshold: Number(d.freeShippingThreshold) || 0,
        }),
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (session?.user) {
      setForm((f) => ({
        ...f,
        name: f.name || session.user?.name || "",
        email: f.email || session.user?.email || "",
      }));
    }
  }, [session]);

  useEffect(() => {
    if (hydrated && items.length === 0) router.replace("/cart");
  }, [hydrated, items.length, router]);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  const discount = coupon?.discount ?? 0;
  const shipping =
    shippingCfg.fee > 0 &&
    (shippingCfg.threshold <= 0 || subtotal < shippingCfg.threshold)
      ? shippingCfg.fee
      : 0;
  const total = Math.max(0, subtotal - discount) + shipping;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          couponCode: coupon?.code,
          customer: { name: form.name, phone: form.phone },
          shipping: {
            address: form.address,
            city: form.city,
            state: form.state,
            note: form.note || undefined,
          },
          items: items.map((i) => ({
            productId: i.productId,
            slug: i.slug,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Could not start checkout.");
        setLoading(false);
        return;
      }
      window.location.href = data.authorizationUrl;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10";

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <CheckoutSteps current={1} />

      <h1 className="mt-8 text-3xl font-semibold tracking-tight text-stone-900">
        Checkout
      </h1>
      {!session?.user ? (
        <p className="mt-2 text-sm text-stone-600">
          Checking out as a guest.{" "}
          <Link
            href="/login?callbackUrl=/checkout"
            className="font-semibold text-stone-900 underline underline-offset-4"
          >
            Sign in
          </Link>{" "}
          to save your orders.
        </p>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]"
      >
        <div className="space-y-6">
          <section className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-stone-900">
              Contact details
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-stone-700">
                  Full name
                </label>
                <input
                  required
                  value={form.name}
                  onChange={update("name")}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">
                  Email
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">
                  Phone
                </label>
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={update("phone")}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-stone-900">
              Delivery address
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-stone-700">
                  Address
                </label>
                <input
                  required
                  value={form.address}
                  onChange={update("address")}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">
                  City
                </label>
                <input
                  required
                  value={form.city}
                  onChange={update("city")}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">
                  State
                </label>
                <input
                  required
                  value={form.state}
                  onChange={update("state")}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-stone-700">
                  Delivery note (optional)
                </label>
                <textarea
                  rows={3}
                  value={form.note}
                  onChange={update("note")}
                  className={inputClass}
                />
              </div>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold text-stone-900">Order summary</h2>

          {/* items with thumbnails */}
          <ul className="mt-4 space-y-3">
            {items.map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : null}
                  <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-900 px-1 text-[11px] font-semibold text-white">
                    {item.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-stone-900">
                    {item.name}
                  </p>
                  {item.size || item.color ? (
                    <p className="text-xs text-stone-500">
                      {[item.size, item.color].filter(Boolean).join(" · ")}
                    </p>
                  ) : null}
                </div>
                <span className="shrink-0 text-sm font-medium text-stone-900">
                  {formatNaira(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          {/* totals */}
          <div className="mt-5 space-y-2 border-t border-stone-200 pt-4 text-sm">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span>{formatNaira(subtotal)}</span>
            </div>
            {discount > 0 ? (
              <div className="flex justify-between text-[#047857]">
                <span>
                  Discount{coupon?.code ? ` (${coupon.code})` : ""}
                </span>
                <span>−{formatNaira(discount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-stone-600">
              <span>Shipping</span>
              <span>{shipping > 0 ? formatNaira(shipping) : "Free"}</span>
            </div>
            <div className="flex justify-between border-t border-stone-100 pt-2 text-base font-semibold text-stone-900">
              <span>Total</span>
              <span>{formatNaira(total)}</span>
            </div>
          </div>

          <p className="mt-3 text-xs text-stone-400">
            Have a coupon?{" "}
            <Link
              href="/cart"
              className="font-medium text-stone-600 underline underline-offset-2 hover:text-stone-900"
            >
              Add it in your cart
            </Link>
            .
          </p>

          {error ? (
            <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading || items.length === 0}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            Pay {formatNaira(total)}
            {!loading ? <ArrowRight className="h-4 w-4" /> : null}
          </button>

          {/* trust badges */}
          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-stone-100 pt-5 text-center">
            {[
              { Icon: ShieldCheck, label: "Secure\ncheckout" },
              { Icon: Truck, label: "Fast\nshipping" },
              { Icon: RotateCcw, label: "Easy\nreturns" },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <Icon className="h-5 w-5 text-stone-700" strokeWidth={1.6} />
                <span className="text-[11px] leading-tight whitespace-pre-line text-stone-500">
                  {label}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-stone-500">
            <Lock className="h-3 w-3" /> Secured by Paystack
          </p>
        </aside>
      </form>
    </main>
  );
}
