import { redirect } from "next/navigation";
import { MessageSquareText } from "lucide-react";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { RefundRequest, type IRefundRequest } from "@/lib/models/RefundRequest";
import AccountNav from "@/components/account/AccountNav";

export const metadata = { title: "My requests", robots: { index: false, follow: false } };
const styles: Record<string, string> = { pending: "bg-amber-100 text-amber-800", approved: "bg-emerald-100 text-emerald-800", declined: "bg-stone-200 text-stone-700" };

export default async function AccountRequestsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account/requests");
  await connectToDatabase();
  const requests = await RefundRequest.find({ $or: [{ user: session.user.id }, { email: (session.user.email ?? "").toLowerCase() }] }).sort({ createdAt: -1 }).lean<IRefundRequest[]>();

  return <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12"><div className="mb-7"><p className="text-xs font-semibold tracking-[0.18em] text-stone-400 uppercase">Becca&apos;s Knotique</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">My account</h1></div><div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]"><AccountNav name={session.user.name} /><section><h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-stone-900"><MessageSquareText className="h-5 w-5" />My requests</h2><p className="mt-1 text-sm text-stone-500">Updates on your refund requests.</p><div className="mt-5 overflow-hidden rounded-2xl border border-stone-200 bg-white">{requests.length === 0 ? <div className="px-6 py-16 text-center"><p className="font-semibold text-stone-900">No requests yet</p><p className="mt-1 text-sm text-stone-500">Any refund request you make from an order will appear here.</p></div> : <ul className="divide-y divide-stone-100">{requests.map((request) => <li key={request._id.toString()} className="p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-xs text-stone-500">{request.orderReference}</p><p className="mt-1 text-sm text-stone-600">{request.reason}</p><p className="mt-2 text-xs text-stone-400">Sent {new Date(request.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${styles[request.status] ?? styles.pending}`}>{request.status}</span></div>{request.adminNote ? <p className="mt-4 rounded-xl bg-stone-50 p-3 text-sm text-stone-600">{request.adminNote}</p> : null}</li>)}</ul>}</div></section></div></main>;
}
