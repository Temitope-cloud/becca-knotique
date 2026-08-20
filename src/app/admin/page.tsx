import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { Order, type IOrder } from "@/lib/models/Order";
import { User } from "@/lib/models/User";
import { Product } from "@/lib/models/Product";
import { formatNaira } from "@/lib/money";

const statusStyles: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-rose-100 text-rose-800",
  cancelled: "bg-stone-200 text-stone-700",
};

interface BestSeller {
  _id: string;
  qty: number;
  revenue: number;
}

export default async function AdminDashboard() {
  await requireAdmin();
  await connectToDatabase();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    paidOrders,
    totalOrders,
    pendingOrders,
    customers,
    productCount,
    recentOrders,
    lowStock,
    bestSellers,
  ] = await Promise.all([
    Order.find({ status: "paid" }).select("amount paidAt").lean<IOrder[]>(),
    Order.estimatedDocumentCount(),
    Order.countDocuments({ status: "pending" }),
    User.countDocuments({ role: { $ne: "admin" } }),
    Product.estimatedDocumentCount(),
    Order.find({}).sort({ createdAt: -1 }).limit(6).lean<IOrder[]>(),
    Product.find({ stockCount: { $lte: 3 } })
      .select("name stockCount slug")
      .sort({ stockCount: 1 })
      .limit(5)
      .lean(),
    Order.aggregate<BestSeller>([
      { $match: { status: "paid" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          qty: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { qty: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const revenue = paidOrders.reduce((s, o) => s + o.amount, 0);
  const monthRevenue = paidOrders
    .filter((o) => o.paidAt && new Date(o.paidAt) >= startOfMonth)
    .reduce((s, o) => s + o.amount, 0);

  const stats = [
    {
      label: "Revenue (paid)",
      value: formatNaira(revenue),
      sub: `${formatNaira(monthRevenue)} this month`,
      icon: TrendingUp,
    },
    {
      label: "Orders",
      value: totalOrders.toString(),
      sub: `${pendingOrders} pending`,
      icon: ShoppingBag,
    },
    {
      label: "Customers",
      value: customers.toString(),
      sub: "registered accounts",
      icon: Users,
    },
    {
      label: "Products",
      value: productCount.toString(),
      sub: "in catalog",
      icon: Package,
    },
  ];

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Here&apos;s how Becca&apos;s Knotique is doing.
        </p>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-stone-200 bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-stone-500">{s.label}</p>
              <s.icon className="h-4 w-4 text-stone-400" />
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">
              {s.value}
            </p>
            <p className="mt-1 text-xs text-stone-400">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* recent orders */}
        <div className="lg:col-span-2 rounded-2xl border border-stone-200 bg-white">
          <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
            <h2 className="font-semibold text-stone-900">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-stone-900"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-stone-500">
              No orders yet.
            </p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {recentOrders.map((o) => (
                <li key={o.reference}>
                  <Link
                    href={`/admin/orders/${o.reference}`}
                    className="flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-stone-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-stone-900">
                        {o.customer?.name || o.email}
                      </p>
                      <p className="truncate text-xs text-stone-400">
                        {new Date(o.createdAt).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        · {o.items.length} item{o.items.length > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          statusStyles[o.status] ?? statusStyles.cancelled
                        }`}
                      >
                        {o.status}
                      </span>
                      <span className="w-24 text-right text-sm font-semibold text-stone-900">
                        {formatNaira(o.amount)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* side column: best sellers + low stock */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="font-semibold text-stone-900">Best sellers</h2>
            {bestSellers.length === 0 ? (
              <p className="mt-3 text-sm text-stone-500">No sales yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {bestSellers.map((b, i) => (
                  <li
                    key={b._id ?? i}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-semibold text-stone-600">
                        {i + 1}
                      </span>
                      <span className="truncate text-stone-700">{b._id}</span>
                    </span>
                    <span className="shrink-0 text-xs text-stone-400">
                      {b.qty} sold
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="flex items-center gap-2 font-semibold text-stone-900">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Low stock
            </h2>
            {lowStock.length === 0 ? (
              <p className="mt-3 text-sm text-stone-500">
                Everything is well stocked.
              </p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {lowStock.map((p) => (
                  <li
                    key={p.slug}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <Link
                      href={`/admin/products/${p._id}`}
                      className="truncate text-stone-700 hover:text-stone-900 hover:underline"
                    >
                      {p.name}
                    </Link>
                    <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      {p.stockCount ?? 0} left
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
