import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { Order, type IOrder } from "@/lib/models/Order";
import { formatNaira } from "@/lib/money";
import { paystackRefundable } from "@/lib/refunds";
import OrderStatusControls from "@/components/admin/OrderStatusControls";
import RefundPanel from "@/components/admin/RefundPanel";

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  await connectToDatabase();
  const order = await Order.findOne({ reference: id }).lean<IOrder>();

  if (!order) notFound();

  return (
    <div className="px-5 py-8 sm:px-8">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
            Order {order.orderNumber ?? ""}
          </h1>
          <p className="mt-1 font-mono text-xs text-stone-400">
            {order.reference}
          </p>
        </div>
        <p className="text-sm text-stone-500">
          {new Date(order.createdAt).toLocaleString("en-NG", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* items + totals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="font-semibold text-stone-900">Items</h2>
            <ul className="mt-4 divide-y divide-stone-100">
              {order.items.map((item, i) => (
                <li key={i} className="py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-stone-700">
                      {item.name}
                      {item.size ? ` · ${item.size}` : ""}
                      {item.color ? ` · ${item.color}` : ""}
                      <span className="text-stone-400"> × {item.quantity}</span>
                    </span>
                    <span className="font-medium text-stone-900">
                      {formatNaira(item.price * item.quantity)}
                    </span>
                  </div>
                  {item.customColor ||
                  item.measurements?.length ||
                  item.referenceImage ? (
                    <div className="mt-2 space-y-1 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-stone-700">
                      <p className="font-semibold tracking-wide text-amber-800 uppercase">
                        Custom order
                      </p>
                      {item.customColor ? (
                        <p>
                          <span className="font-medium">Colour:</span>{" "}
                          {item.customColor}
                        </p>
                      ) : null}
                      {item.measurements?.length ? (
                        <ul className="space-y-0.5">
                          {item.measurements.map((m, mi) => (
                            <li key={mi}>
                              <span className="font-medium">{m.label}:</span>{" "}
                              {m.value}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {item.referenceImage ? (
                        <a
                          href={item.referenceImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block font-medium text-emerald-700 underline underline-offset-2"
                        >
                          View reference image →
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1.5 border-t border-stone-100 pt-4 text-sm">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal</span>
                <span>{formatNaira(order.subtotal ?? order.amount)}</span>
              </div>
              {order.discount ? (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                  <span>−{formatNaira(order.discount)}</span>
                </div>
              ) : null}
              {order.storeCreditApplied ? (
                <div className="flex justify-between text-emerald-700">
                  <span>Store credit used</span>
                  <span>−{formatNaira(order.storeCreditApplied)}</span>
                </div>
              ) : null}
              <div className="flex justify-between pt-1 text-base font-semibold text-stone-900">
                <span>Total</span>
                <span>{formatNaira(order.amount)}</span>
              </div>
              {order.refundedAmount ? (
                <div className="flex justify-between text-rose-600">
                  <span>Refunded</span>
                  <span>−{formatNaira(order.refundedAmount)}</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="font-semibold text-stone-900">Customer & delivery</h2>
            <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-stone-400">Name</dt>
                <dd className="text-stone-800">{order.customer?.name}</dd>
              </div>
              <div>
                <dt className="text-stone-400">Email</dt>
                <dd className="text-stone-800">{order.email}</dd>
              </div>
              <div>
                <dt className="text-stone-400">Phone</dt>
                <dd className="text-stone-800">{order.customer?.phone}</dd>
              </div>
              <div>
                <dt className="text-stone-400">Address</dt>
                <dd className="text-stone-800">
                  {order.shipping?.address}, {order.shipping?.city},{" "}
                  {order.shipping?.state}
                </dd>
              </div>
              {order.shipping?.note ? (
                <div className="sm:col-span-2">
                  <dt className="text-stone-400">Note</dt>
                  <dd className="text-stone-800">{order.shipping.note}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>

        {/* status controls + refunds */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="mb-4 font-semibold text-stone-900">Update status</h2>
            <OrderStatusControls
              reference={order.reference}
              status={order.status}
              fulfillmentStatus={order.fulfillmentStatus ?? "unfulfilled"}
            />
          </div>

          {order.status === "paid" ? (
            <RefundPanel
              reference={order.orderNumber ?? order.reference}
              amount={order.amount}
              refundedAmount={order.refundedAmount ?? 0}
              refunds={(order.refunds ?? []).map((r) => ({
                amount: r.amount,
                reason: r.reason,
                method: r.method,
                note: r.note,
                createdAt: new Date(r.createdAt).toISOString(),
              }))}
              hasCustomer={!!order.user}
              paystackRefundable={paystackRefundable(order)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
