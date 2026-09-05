import Link from "next/link";
import type { Metadata } from "next";
import { Clock, XCircle } from "lucide-react";
import { verifyAndSyncOrder } from "@/lib/orders";
import { formatNaira } from "@/lib/money";
import ClearCartOnPaid from "@/components/cart/ClearCartOnPaid";
import CheckoutSteps from "@/components/CheckoutSteps";
import OrderReceipt from "@/components/order/OrderReceipt";

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

  const actions = (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-3 print:hidden">
      <Link
        href="/products"
        className="rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
      >
        Continue shopping
      </Link>
      {order ? (
        <Link
          href={`/track?ref=${encodeURIComponent(order.orderNumber ?? order.reference)}`}
          className="rounded-xl border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
        >
          Track order
        </Link>
      ) : null}
      <Link
        href="/account"
        className="rounded-xl border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
      >
        View my orders
      </Link>
    </div>
  );

  // Paid: the celebratory receipt.
  if (paid && order) {
    return (
      <main
        className="w-full bg-stone-100 px-4 py-10"
        style={{ "--bk-receipt-bg": "#f5f5f4" } as React.CSSProperties}
      >
        <ClearCartOnPaid active />
        <div className="mx-auto w-full max-w-2xl print:hidden">
          <CheckoutSteps current={2} />
        </div>
        <div className="mt-8">
          <OrderReceipt order={order} />
        </div>
        {actions}
      </main>
    );
  }

  // Pending / failed / not found: a clean, simple status card.
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col px-4 py-10 text-center">
      <CheckoutSteps current={2} />
      <div className="flex flex-1 flex-col items-center justify-center pt-10">
        {pending ? (
          <Clock className="h-16 w-16 text-amber-500" />
        ) : (
          <XCircle className="h-16 w-16 text-rose-500" />
        )}

        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-stone-900">
          {pending ? "Payment pending" : "We couldn't confirm your payment"}
        </h1>

        {order ? (
          <div className="mt-4 w-full rounded-2xl border border-stone-200 bg-white p-6 text-left">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500">Order reference</span>
              <span className="font-mono text-stone-900">
                {order.orderNumber ?? order.reference}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-stone-500">Total</span>
              <span className="font-semibold text-stone-900">
                {formatNaira(order.amount)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-stone-500">Status</span>
              <span className="font-medium text-stone-900 capitalize">
                {order.status}
              </span>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-stone-600">
            We couldn&apos;t find that order. If you were charged, please contact
            us and we&apos;ll sort it out right away.
          </p>
        )}

        <p className="mt-6 text-sm text-stone-600">
          {pending
            ? "Your payment is still processing. This page will reflect the final status shortly."
            : "No charge may have been completed. You can try again from your cart."}
        </p>

        {actions}
      </div>
    </main>
  );
}
