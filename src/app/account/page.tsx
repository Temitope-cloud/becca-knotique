import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Package, ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { Order, type IOrder } from "@/lib/models/Order";
import { formatNaira } from "@/lib/money";
import SignOutButton from "@/components/auth/SignOutButton";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false, follow: false },
};

const statusStyles: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-rose-100 text-rose-800",
  cancelled: "bg-stone-200 text-stone-700",
};

async function getOrders(userId: string, email: string): Promise<IOrder[]> {
  await connectToDatabase();
  const orders = await Order.find({
    $or: [{ user: userId }, { email: email.toLowerCase() }],
  })
    .sort({ createdAt: -1 })
    .lean<IOrder[]>();
  return orders;
}

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/account");
  }

  const orders = await getOrders(session.user.id, session.user.email ?? "");

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
            My account
          </h1>
          <p className="mt-1 text-stone-600">
            {session.user.name} · {session.user.email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {session.user.role === "admin" ? (
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              <ShieldCheck className="h-4 w-4" /> Admin
            </Link>
          ) : null}
          <SignOutButton />
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-stone-900">Order history</h2>

        {orders.length === 0 ? (
          <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-6 py-14 text-center">
            <Package className="h-10 w-10 text-stone-300" />
            <p className="mt-4 text-stone-600">
              You haven&apos;t placed any orders yet.
            </p>
            <Link
              href="/products"
              className="mt-6 rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <ul className="mt-4 space-y-4">
            {orders.map((order) => (
              <li
                key={order.reference}
                className="rounded-2xl border border-stone-200 bg-white p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-stone-500">
                      {order.reference}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      {new Date(order.createdAt).toLocaleDateString("en-NG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
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

                <ul className="mt-4 space-y-1.5 border-t border-stone-100 pt-4">
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

                <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
                  <span className="text-sm text-stone-500">Total</span>
                  <span className="font-semibold text-stone-900">
                    {formatNaira(order.amount)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
