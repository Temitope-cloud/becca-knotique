import { redirect } from "next/navigation";
import { Wallet } from "lucide-react";
import { auth } from "@/auth";
import { getStoreCredit, listStoreCreditEntries } from "@/lib/store-credit";
import { formatNaira } from "@/lib/money";
import AccountNav from "@/components/account/AccountNav";

export const metadata = { title: "Store credit", robots: { index: false, follow: false } };
const labels: Record<string, string> = { refund: "Refund credit", spend: "Used on an order", reversal: "Credit returned", adjustment: "Store credit added" };

export default async function StoreCreditPage() {
  const session = await auth(); if (!session?.user) redirect("/login?callbackUrl=/account/credit");
  const [balance, entries] = await Promise.all([getStoreCredit(session.user.id), listStoreCreditEntries(session.user.id)]);
  return <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12"><div className="mb-7"><p className="text-xs font-semibold tracking-[0.18em] text-stone-400 uppercase">Becca&apos;s Knotique</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">My account</h1></div><div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]"><AccountNav name={session.user.name} /><section><h2 className="text-2xl font-semibold tracking-tight text-stone-900">Store credit</h2><p className="mt-1 text-sm text-stone-500">Credit is automatically available at checkout.</p><div className="mt-5 rounded-2xl bg-emerald-700 p-6 text-white"><Wallet className="h-6 w-6 text-emerald-100" /><p className="mt-6 text-sm text-emerald-100">Available balance</p><p className="mt-1 text-4xl font-semibold tracking-tight">{formatNaira(balance)}</p></div><div className="mt-5 overflow-hidden rounded-2xl border border-stone-200 bg-white"><div className="border-b border-stone-100 px-5 py-4"><h3 className="font-semibold text-stone-900">Credit history</h3></div>{entries.length ? <ul className="divide-y divide-stone-100">{entries.map((entry) => <li key={entry._id} className="flex items-center justify-between gap-4 px-5 py-4"><div><p className="text-sm font-medium text-stone-900">{labels[entry.reason] ?? entry.reason}</p><p className="mt-1 text-xs text-stone-500">{entry.description || entry.orderRef || new Date(entry.createdAt).toLocaleDateString("en-NG")}</p></div><p className={`font-semibold ${entry.amount >= 0 ? "text-emerald-700" : "text-stone-600"}`}>{entry.amount >= 0 ? "+" : "−"}{formatNaira(Math.abs(entry.amount))}</p></li>)}</ul> : <p className="px-5 py-12 text-center text-sm text-stone-500">You do not have any store credit activity yet.</p>}</div></section></div></main>;
}
