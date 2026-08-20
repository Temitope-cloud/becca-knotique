import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { Order, type IOrder } from "@/lib/models/Order";
import { formatNaira } from "@/lib/money";
import OrderStatusControls from "@/components/admin/OrderStatusControls";

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
            Order
          </h1>
          <p className="mt-1 font-mono text-sm text-stone-500">
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
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 py-3 text-sm"
                >
                  <span className="text-stone-700">
                    {item.name}
                    {item.size ? ` · ${item.size}` : ""}
                    {item.color ? ` · ${item.color}` : ""}
                    <span className="text-stone-400"> × {item.quantity}</span>
                  </span>
                  <span className="font-medium text-stone-900">
                    {formatNaira(item.price * item.quantity)}
                  </span>
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
              <div className="flex justify-between pt-1 text-base font-semibold text-stone-900">
                <span>Total</span>
                <span>{formatNaira(order.amount)}</span>
              </div>
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

        {/* status controls */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-stone-900">Update status</h2>
          <OrderStatusControls
            reference={order.reference}
            status={order.status}
            fulfillmentStatus={order.fulfillmentStatus ?? "unfulfilled"}
          />
        </div>
      </div>
    </div>
  );
}
