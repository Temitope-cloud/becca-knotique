import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { verifyAndSyncOrder } from "@/lib/orders";
import { formatNaira } from "@/lib/money";
import ClearCartOnPaid from "@/components/cart/ClearCartOnPaid";

export const metadata: Metadata = {
  title: "Order status",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ reference?: string; trxref?: string }>;

export default async function OrderCallbackPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { reference, trxref } = await searchParams;
  const ref = reference || trxref;

  const order = ref ? await verifyAndSyncOrder(ref) : null;
  const paid = order?.status === "paid";
  const pending = order?.status === "pending";

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <ClearCartOnPaid active={paid} />

      {paid ? (
        <CheckCircle2 className="h-16 w-16 text-emerald-600" />
      ) : pending ? (
        <Clock className="h-16 w-16 text-amber-500" />
      ) : (
        <XCircle className="h-16 w-16 text-rose-500" />
      )}

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-stone-900">
        {paid
          ? "Payment successful"
          : pending
            ? "Payment pending"
            : "We couldn't confirm your payment"}
      </h1>

      {order ? (
        <div className="mt-4 w-full rounded-2xl border border-stone-200 bg-white p-6 text-left">
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-500">Order reference</span>
            <span className="font-mono text-stone-900">{order.reference}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-stone-500">Total</span>
            <span className="font-semibold text-stone-900">
              {formatNaira(order.amount)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-stone-500">Status</span>
            <span className="font-medium capitalize text-stone-900">
              {order.status}
            </span>
          </div>
          <ul className="mt-4 space-y-2 border-t border-stone-100 pt-4">
            {order.items.map((item, i) => (
              <li
                key={i}
                className="flex items-center justify-between text-sm text-stone-600"
              >
                <span>
                  {item.name}
                  {item.size ? ` · ${item.size}` : ""} × {item.quantity}
                </span>
                <span>{formatNaira(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-stone-600">
          We couldn&apos;t find that order. If you were charged, please contact
          us and we&apos;ll sort it out right away.
        </p>
      )}

      <p className="mt-6 text-sm text-stone-600">
        {paid
          ? "Thank you! We've received your order and will be in touch about delivery."
          : pending
            ? "Your payment is still processing. This page will reflect the final status shortly."
            : "No charge may have been completed. You can try again from your cart."}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/products"
          className="rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          Continue shopping
        </Link>
        <Link
          href="/account"
          className="rounded-xl border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
        >
          View my orders
        </Link>
      </div>
    </main>
  );
}
