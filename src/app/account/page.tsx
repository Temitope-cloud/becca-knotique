import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, Clock3, Heart, Package, ShieldCheck, ShoppingBag, Wallet } from "lucide-react";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { Order, type IOrder } from "@/lib/models/Order";
import { formatNaira } from "@/lib/money";
import { getStoreCredit, listStoreCreditEntries } from "@/lib/store-credit";
import { totalRefundable } from "@/lib/refunds";
import { RefundRequest, type IRefundRequest } from "@/lib/models/RefundRequest";
import { User } from "@/lib/models/User";
import SignOutButton from "@/components/auth/SignOutButton";
import RefundRequestForm from "@/components/account/RefundRequestForm";
import DeleteAccountButton from "@/components/account/DeleteAccountButton";

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
  const [storeCredit, creditEntries, refundReqs, profile] = await Promise.all([
    getStoreCredit(session.user.id),
    listStoreCreditEntries(session.user.id, 6),
    RefundRequest.find({
      $or: [
        { user: session.user.id },
        { email: (session.user.email ?? "").toLowerCase() },
      ],
    })
      .sort({ createdAt: -1 })
      .lean<IRefundRequest[]>(),
    User.findById(session.user.id).select("wishlist phone createdAt").lean<{
      wishlist?: string[];
      phone?: string;
      createdAt?: Date;
    }>(),
  ]);

  // Latest request per order reference (for status + eligibility).
  const requestByOrder = new Map<string, IRefundRequest>();
  for (const r of refundReqs) {
    if (!requestByOrder.has(r.orderReference)) requestByOrder.set(r.orderReference, r);
  }

  const creditReasonLabel: Record<string, string> = {
    refund: "Refund credit",
    spend: "Used on an order",
    reversal: "Credit returned",
    adjustment: "Adjustment",
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="overflow-hidden rounded-3xl bg-stone-950 text-white">
        <div className="flex flex-wrap items-center justify-between gap-6 px-6 py-7 sm:px-8 sm:py-9">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xl font-semibold text-stone-950">
              {(session.user.name || session.user.email || "B").trim().charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="text-sm text-white/60">Welcome back</p>
              <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">{session.user.name || "Becca’s Knotique customer"}</h1>
              <p className="mt-1 truncate text-sm text-white/65">{session.user.email}</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs font-medium tracking-[0.16em] text-emerald-300 uppercase">Member since</p>
            <p className="mt-1 text-sm text-white/80">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-NG", { month: "long", year: "numeric" }) : "Becca’s Knotique"}</p>
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-3 sm:grid-cols-3">
        <Link href="/account/wishlist" className="group rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-stone-300 hover:shadow-sm"><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><Heart className="h-5 w-5" /></span><ArrowRight className="h-4 w-4 text-stone-300 transition group-hover:translate-x-0.5 group-hover:text-stone-700" /></div><p className="mt-4 font-semibold text-stone-900">Wishlist</p><p className="mt-1 text-sm text-stone-500">{profile?.wishlist?.length ?? 0} saved piece{(profile?.wishlist?.length ?? 0) === 1 ? "" : "s"}</p></Link>
        <Link href="/account/security" className="group rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-stone-300 hover:shadow-sm"><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><ShieldCheck className="h-5 w-5" /></span><ArrowRight className="h-4 w-4 text-stone-300 transition group-hover:translate-x-0.5 group-hover:text-stone-700" /></div><p className="mt-4 font-semibold text-stone-900">Security</p><p className="mt-1 text-sm text-stone-500">Protect your account</p></Link>
        <Link href="/products" className="group rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-stone-300 hover:shadow-sm"><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-900"><ShoppingBag className="h-5 w-5" /></span><ArrowRight className="h-4 w-4 text-stone-300 transition group-hover:translate-x-0.5 group-hover:text-stone-700" /></div><p className="mt-4 font-semibold text-stone-900">Shop collection</p><p className="mt-1 text-sm text-stone-500">Find your next handmade piece</p></Link>
      </section>

      <section className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-4"><p className="text-sm text-stone-500">Orders placed</p><p className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">{orders.length}</p></div>
        <div className="rounded-2xl border border-stone-200 bg-white p-4"><p className="text-sm text-stone-500">In progress</p><p className="mt-2 flex items-center gap-2 text-3xl font-semibold tracking-tight text-stone-900"><Clock3 className="h-5 w-5 text-amber-600" />{orders.filter((order) => order.status === "pending" || (order.status === "paid" && order.fulfillmentStatus !== "delivered")).length}</p></div>
        <div className="rounded-2xl border border-stone-200 bg-white p-4"><p className="text-sm text-stone-500">Store credit</p><p className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">{formatNaira(storeCredit)}</p></div>
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-stone-900">Your account</h2>
          <p className="mt-1 text-sm text-stone-500">Orders, credit, and account protection in one place.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
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

      {storeCredit > 0 || creditEntries.length > 0 ? (
        <section className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
                <Wallet className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm text-stone-600">Store credit balance</p>
                <p className="text-2xl font-semibold text-stone-900">
                  {formatNaira(storeCredit)}
                </p>
              </div>
            </div>
            {storeCredit > 0 ? (
              <Link
                href="/products"
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Shop with credit
              </Link>
            ) : null}
          </div>

          {creditEntries.length > 0 ? (
            <ul className="mt-4 divide-y divide-emerald-100 border-t border-emerald-100 pt-2 text-sm">
              {creditEntries.map((e) => (
                <li
                  key={e._id}
                  className="flex items-center justify-between py-2"
                >
                  <span className="text-stone-600">
                    {creditReasonLabel[e.reason] ?? e.reason}
                    {e.orderRef ? (
                      <span className="text-stone-400"> · {e.orderRef}</span>
                    ) : null}
                  </span>
                  <span
                    className={`font-semibold ${
                      e.amount >= 0 ? "text-emerald-700" : "text-stone-500"
                    }`}
                  >
                    {e.amount >= 0 ? "+" : "−"}
                    {formatNaira(Math.abs(e.amount))}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

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
                      {order.orderNumber ?? order.reference}
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
                {order.refundedAmount ? (
                  <div className="mt-2 flex items-center justify-between rounded-lg bg-rose-50 px-3 py-2 text-sm">
                    <span className="font-medium text-rose-700">
                      {order.refundStatus === "full"
                        ? "Refunded"
                        : "Partially refunded"}
                    </span>
                    <span className="font-semibold text-rose-700">
                      {formatNaira(order.refundedAmount)}
                    </span>
                  </div>
                ) : null}

                {/* Refund request: show status, or offer to request one. */}
                {(() => {
                  const req = requestByOrder.get(order.reference);
                  if (req?.status === "pending") {
                    return (
                      <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                        Refund request under review.
                      </p>
                    );
                  }
                  if (req?.status === "declined") {
                    return (
                      <p className="mt-3 rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-600">
                        Refund request declined
                        {req.adminNote ? `: ${req.adminNote}` : "."}
                      </p>
                    );
                  }
                  // Approved requests are reflected by the refund badge above.
                  if (
                    !req &&
                    order.status === "paid" &&
                    totalRefundable(order) > 0
                  ) {
                    return (
                      <RefundRequestForm
                        orderRef={order.orderNumber ?? order.reference}
                      />
                    );
                  }
                  return null;
                })()}
                <div className="mt-3 text-right">
                  <Link
                    href={`/track?ref=${encodeURIComponent(order.orderNumber ?? order.reference)}`}
                    className="text-sm font-medium text-stone-600 underline underline-offset-4 hover:text-stone-900"
                  >
                    Track order
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {session.user.role !== "admin" ? (
        <section className="mt-12 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <h2 className="text-base font-semibold text-stone-900">
            Delete account
          </h2>
          <p className="mt-1 max-w-xl text-sm text-stone-600">
            Close your account. You have 30 days to change your mind, just log
            back in to restore it. After that it&apos;s permanently deleted: your
            profile is removed and any store credit is forfeited. Past orders
            stay on our records for tax and accounting, but are no longer linked
            to you.
          </p>
          <div className="mt-4">
            <DeleteAccountButton
              storeCredit={storeCredit}
              pendingRefunds={
                refundReqs.filter((r) => r.status === "pending").length
              }
            />
          </div>
        </section>
      ) : null}
    </main>
  );
}
