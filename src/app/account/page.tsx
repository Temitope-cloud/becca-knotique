import { redirect } from "next/navigation";
import { Package, Clock3, ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { Order, type IOrder } from "@/lib/models/Order";
import { RefundRequest, type IRefundRequest } from "@/lib/models/RefundRequest";
import { totalRefundable } from "@/lib/refunds";
import { formatNaira } from "@/lib/money";
import AccountNav from "@/components/account/AccountNav";
import RefundRequestForm from "@/components/account/RefundRequestForm";
import Link from "next/link";

export const metadata = { title: "My orders", robots: { index: false, follow: false } };
const statusStyles: Record<string, string> = { paid: "bg-emerald-100 text-emerald-800", pending: "bg-amber-100 text-amber-800", failed: "bg-rose-100 text-rose-700", cancelled: "bg-stone-200 text-stone-700" };
async function getOrders(userId: string, email: string) { await connectToDatabase(); return Order.find({ $or: [{ user: userId }, { email: email.toLowerCase() }] }).sort({ createdAt: -1 }).lean<IOrder[]>(); }

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");
  const [orders, requests] = await Promise.all([getOrders(session.user.id, session.user.email ?? ""), RefundRequest.find({ $or: [{ user: session.user.id }, { email: (session.user.email ?? "").toLowerCase() }] }).sort({ createdAt: -1 }).lean<IRefundRequest[]>()]);
  const requestByOrder = new Map<string, IRefundRequest>();
  requests.forEach((request) => { if (!requestByOrder.has(request.orderReference)) requestByOrder.set(request.orderReference, request); });
  const inProgress = orders.filter((order) => order.status === "pending" || (order.status === "paid" && order.fulfillmentStatus !== "delivered")).length;
  return <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
    <div className="mb-7"><p className="text-xs font-semibold tracking-[0.18em] text-stone-400 uppercase">Becca&apos;s Knotique</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">My account</h1><p className="mt-1 text-sm text-stone-500">Welcome back, {session.user.name}.</p></div>
    <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]"><AccountNav name={session.user.name} />
      <section className="min-w-0"><div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-2xl font-semibold tracking-tight text-stone-900">My orders</h2><p className="mt-1 text-sm text-stone-500">Track every handmade piece from order to delivery.</p></div><Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700 underline underline-offset-4 hover:text-stone-950">Continue shopping <ArrowRight className="h-4 w-4" /></Link></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-stone-200 bg-white p-4"><p className="text-sm text-stone-500">All orders</p><p className="mt-1 text-3xl font-semibold text-stone-900">{orders.length}</p></div><div className="rounded-2xl border border-stone-200 bg-white p-4"><p className="text-sm text-stone-500">In progress</p><p className="mt-1 flex items-center gap-2 text-3xl font-semibold text-stone-900"><Clock3 className="h-5 w-5 text-amber-600" />{inProgress}</p></div></div>
      <div className="mt-5 overflow-hidden rounded-2xl border border-stone-200 bg-white">{orders.length === 0 ? <div className="flex flex-col items-center px-6 py-16 text-center"><Package className="h-10 w-10 text-stone-300" /><p className="mt-4 font-semibold text-stone-900">No orders yet</p><p className="mt-1 text-sm text-stone-500">Your handmade pieces will appear here once ordered.</p><Link href="/products" className="mt-5 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white">Shop the collection</Link></div> : <ul className="divide-y divide-stone-100">{orders.map((order) => { const request = requestByOrder.get(order.reference); return <li key={order.reference} className="p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-xs text-stone-500">{order.orderNumber ?? order.reference}</p><p className="mt-1 font-semibold text-stone-900">{order.items.map((item) => item.name).join(", ")}</p><p className="mt-1 text-sm text-stone-500">{new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[order.status] ?? statusStyles.cancelled}`}>{order.status}</span></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4"><p className="text-sm font-semibold text-stone-900">{formatNaira(order.amount)}</p><Link href={`/track?ref=${encodeURIComponent(order.orderNumber ?? order.reference)}`} className="text-sm font-semibold text-stone-600 underline underline-offset-4 hover:text-stone-950">Track order</Link></div>{request?.status === "pending" ? <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">Refund request under review.</p> : null}{!request && order.status === "paid" && totalRefundable(order) > 0 ? <RefundRequestForm orderRef={order.orderNumber ?? order.reference} /> : null}</li>; })}</ul>}</div>
      </section></div>
  </main>;
}
