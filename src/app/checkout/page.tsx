"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Lock, ArrowRight, Check, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatNaira } from "@/lib/money";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, subtotal, hydrated } = useCart();

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

  // coupon
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // shipping (from store settings)
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

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput, subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setCoupon({ code: data.code, discount: data.discount });
        setCouponError(null);
      } else {
        setCoupon(null);
        setCouponError(data.reason || "Invalid code.");
      }
    } catch {
      setCouponError("Could not check that code.");
    } finally {
      setCouponLoading(false);
    }
  }

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
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
        Checkout
      </h1>

      {!session?.user ? (
        <p className="mt-3 text-sm text-stone-600">
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

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-stone-900">Contact details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Full name</label>
                <input required value={form.name} onChange={update("name")} className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Email</label>
                <input required type="email" value={form.email} onChange={update("email")} className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Phone</label>
                <input required type="tel" value={form.phone} onChange={update("phone")} className={inputClass} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-stone-900">Delivery address</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Address</label>
                <input required value={form.address} onChange={update("address")} className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">City</label>
                <input required value={form.city} onChange={update("city")} className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">State</label>
                <input required value={form.state} onChange={update("state")} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Delivery note (optional)</label>
                <textarea rows={3} value={form.note} onChange={update("note")} className={inputClass} />
              </div>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-stone-200 bg-stone-50 p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold text-stone-900">Your order</h2>
          <ul className="mt-4 space-y-3">
            {items.map((item, i) => (
              <li key={i} className="flex items-start justify-between gap-3 text-sm">
                <span className="min-w-0 text-stone-600">
                  {item.name}
                  {item.size ? ` · ${item.size}` : ""}
                  <span className="text-stone-400"> × {item.quantity}</span>
                </span>
                <span className="shrink-0 font-medium text-stone-900">
                  {formatNaira(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          {/* coupon */}
          <div className="mt-4 border-t border-stone-200 pt-4">
            {coupon ? (
              <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4" /> {coupon.code} applied
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCoupon(null);
                    setCouponInput("");
                  }}
                  aria-label="Remove coupon"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Discount code"
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={couponLoading}
                    className="shrink-0 rounded-lg border border-stone-900 px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-900 hover:text-white disabled:opacity-60"
                  >
                    {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                  </button>
                </div>
                {couponError ? (
                  <p className="mt-1.5 text-xs text-rose-600">{couponError}</p>
                ) : null}
              </div>
            )}
          </div>

          {/* totals */}
          <div className="mt-4 space-y-1.5 border-t border-stone-200 pt-4 text-sm">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span>{formatNaira(subtotal)}</span>
            </div>
            {discount > 0 ? (
              <div className="flex justify-between text-emerald-700">
                <span>Discount</span>
                <span>−{formatNaira(discount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-stone-600">
              <span>Shipping</span>
              <span>{shipping > 0 ? formatNaira(shipping) : "Arranged after"}</span>
            </div>
            <div className="flex justify-between pt-2 text-base font-semibold text-stone-900">
              <span>Total</span>
              <span>{formatNaira(total)}</span>
            </div>
          </div>

          {error ? (
            <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading || items.length === 0}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Pay {formatNaira(total)}
            {!loading ? <ArrowRight className="h-4 w-4" /> : null}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-stone-500">
            <Lock className="h-3 w-3" /> Secured by Paystack
          </p>
        </aside>
      </form>
    </main>
  );
}
