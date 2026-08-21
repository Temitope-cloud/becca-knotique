"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Search, PackageSearch } from "lucide-react";
import OrderTimeline, { type TimelineOrder } from "@/components/OrderTimeline";
import { formatNaira } from "@/lib/money";

interface TrackResult extends TimelineOrder {
  found: true;
  reference: string;
  amount: number;
  customerName: string;
  destination: string;
  items: { name: string; quantity: number; size: string | null; image: string | null }[];
}

const statusStyles: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-rose-100 text-rose-800",
  cancelled: "bg-stone-200 text-stone-700",
};

export default function TrackClient() {
  const params = useSearchParams();
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<TrackResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ref = params.get("ref");
    if (ref) setReference(ref);
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOrder(null);
    setLoading(true);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, email }),
      });
      const data = await res.json();
      if (data.found) setOrder(data);
      else setError(data.error || "Order not found.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10";

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-7"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">
              Order number
            </label>
            <input
              required
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="BK-1042"
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60 sm:w-auto"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Track order
        </button>

        <p className="mt-4 text-xs text-stone-500">
          Your order number is in your confirmation. Have an account?{" "}
          <Link
            href="/account"
            className="font-medium text-stone-800 underline underline-offset-2"
          >
            See all your orders
          </Link>
          .
        </p>
      </form>

      {order ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* timeline */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-7">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-stone-400">Order</p>
                <p className="font-mono text-sm text-stone-900">
                  {order.reference}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  statusStyles[order.status] ?? statusStyles.cancelled
                }`}
              >
                {order.status}
              </span>
            </div>
            <OrderTimeline order={order} />
          </div>

          {/* summary */}
          <aside className="h-fit rounded-2xl border border-stone-200 bg-stone-50 p-6">
            <h2 className="text-sm font-semibold text-stone-900">Summary</h2>
            {order.destination ? (
              <p className="mt-1 text-xs text-stone-500">
                Delivering to {order.destination}
              </p>
            ) : null}
            <ul className="mt-4 space-y-2 border-t border-stone-200 pt-4">
              {order.items.map((item, i) => (
                <li key={i} className="text-sm text-stone-600">
                  {item.name}
                  {item.size ? ` · ${item.size}` : ""}
                  <span className="text-stone-400"> × {item.quantity}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4 text-sm">
              <span className="text-stone-500">Total</span>
              <span className="font-semibold text-stone-900">
                {formatNaira(order.amount)}
              </span>
            </div>
          </aside>
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-stone-300 bg-stone-50/60 px-6 py-12 text-center">
          <PackageSearch className="h-10 w-10 text-stone-300" />
          <p className="mt-3 text-sm text-stone-500">
            Enter your order number and email to see live status.
          </p>
        </div>
      )}
    </div>
  );
}
