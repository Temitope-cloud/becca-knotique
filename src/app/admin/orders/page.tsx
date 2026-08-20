import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { Order, type IOrder } from "@/lib/models/Order";
import { formatNaira } from "@/lib/money";

const statusStyles: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-rose-100 text-rose-800",
  cancelled: "bg-stone-200 text-stone-700",
};

const fulfillmentStyles: Record<string, string> = {
  unfulfilled: "bg-stone-100 text-stone-600",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
};

const filters = ["all", "pending", "paid", "failed", "cancelled"] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  await connectToDatabase();

  const query: Record<string, unknown> =
    status && status !== "all" ? { status } : {};
  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .limit(300)
    .lean<IOrder[]>();

  return (
    <div className="px-5 py-8 sm:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
        Orders
      </h1>

      {/* filter tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = (status ?? "all") === f;
          return (
            <Link
              key={f}
              href={f === "all" ? "/admin/orders" : `/admin/orders?status=${f}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
                active
                  ? "bg-stone-900 text-white"
                  : "border border-stone-200 bg-white text-stone-600 hover:border-stone-300"
              }`}
            >
              {f}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-xs tracking-wide text-stone-500 uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Fulfillment</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-stone-500">
                  No orders here.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr
                  key={o.reference}
                  className="border-b border-stone-100 last:border-0"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-stone-500">
                    {new Date(o.createdAt).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-900">
                      {o.customer?.name}
                    </p>
                    <p className="text-xs text-stone-400">{o.email}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold whitespace-nowrap text-stone-900">
                    {formatNaira(o.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                        statusStyles[o.status] ?? statusStyles.cancelled
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                        fulfillmentStyles[o.fulfillmentStatus ?? "unfulfilled"]
                      }`}
                    >
                      {o.fulfillmentStatus ?? "unfulfilled"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/orders/${o.reference}`}
                      className="text-sm font-medium text-stone-600 hover:text-stone-900 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
