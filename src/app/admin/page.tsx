import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { Order, type IOrder } from "@/lib/models/Order";
import { formatNaira } from "@/lib/money";

export const metadata: Metadata = {
  title: "Admin · Orders",
  robots: { index: false, follow: false },
};

const statusStyles: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-rose-100 text-rose-800",
  cancelled: "bg-stone-200 text-stone-700",
};

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }
  if (session.user.role !== "admin") {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-semibold text-stone-900">
          Not authorized
        </h1>
        <p className="mt-2 text-stone-600">
          This area is for the store owner only.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          Back home
        </Link>
      </main>
    );
  }

  await connectToDatabase();
  const orders = await Order.find({})
    .sort({ createdAt: -1 })
    .limit(200)
    .lean<IOrder[]>();

  const paidOrders = orders.filter((o) => o.status === "paid");
  const revenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);

  const stats = [
    { label: "Total orders", value: orders.length.toString() },
    { label: "Paid orders", value: paidOrders.length.toString() },
    { label: "Revenue (paid)", value: formatNaira(revenue) },
    {
      label: "Pending",
      value: orders.filter((o) => o.status === "pending").length.toString(),
    },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
          Orders
        </h1>
        <Link
          href="/account"
          className="text-sm font-medium text-stone-600 hover:text-stone-900"
        >
          ← Back to account
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-stone-200 bg-white p-5"
          >
            <p className="text-sm text-stone-500">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-stone-900">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-xs tracking-wide text-stone-500 uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Reference</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-stone-500"
                >
                  No orders yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.reference}
                  className="border-b border-stone-100 last:border-0 align-top"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-stone-600">
                    {new Date(order.createdAt).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-stone-900">
                      {order.customer?.name}
                    </div>
                    <div className="text-xs text-stone-500">{order.email}</div>
                    <div className="text-xs text-stone-500">
                      {order.customer?.phone}
                    </div>
                    <div className="mt-1 max-w-[220px] text-xs text-stone-500">
                      {order.shipping?.address}, {order.shipping?.city},{" "}
                      {order.shipping?.state}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    <ul className="space-y-0.5">
                      {order.items.map((item, i) => (
                        <li key={i}>
                          {item.name}
                          {item.size ? ` · ${item.size}` : ""} × {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3 font-semibold whitespace-nowrap text-stone-900">
                    {formatNaira(order.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                        statusStyles[order.status] ?? statusStyles.cancelled
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-stone-500">
                    {order.reference}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
