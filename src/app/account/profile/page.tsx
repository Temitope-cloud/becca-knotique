import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getStoreCredit } from "@/lib/store-credit";
import { connectToDatabase } from "@/lib/db";
import { RefundRequest } from "@/lib/models/RefundRequest";
import AccountNav from "@/components/account/AccountNav";
import DeleteAccountButton from "@/components/account/DeleteAccountButton";

export const metadata = { title: "Personal info", robots: { index: false, follow: false } };
export default async function ProfilePage() {
  const session = await auth(); if (!session?.user) redirect("/login?callbackUrl=/account/profile");
  await connectToDatabase();
  const [credit, pendingRefunds] = await Promise.all([
    getStoreCredit(session.user.id),
    RefundRequest.countDocuments({ $or: [{ user: session.user.id }, { email: (session.user.email ?? "").toLowerCase() }], status: "pending" }),
  ]);
  return <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12"><div className="mb-7"><p className="text-xs font-semibold tracking-[0.18em] text-stone-400 uppercase">Becca&apos;s Knotique</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">My account</h1></div><div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]"><AccountNav name={session.user.name} /><section><h2 className="text-2xl font-semibold tracking-tight text-stone-900">Personal info</h2><p className="mt-1 text-sm text-stone-500">Your contact details for orders and account notifications.</p><div className="mt-5 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6"><dl className="space-y-5 text-sm"><div><dt className="text-stone-500">Full name</dt><dd className="mt-1 font-medium text-stone-900">{session.user.name}</dd></div><div><dt className="text-stone-500">Email address</dt><dd className="mt-1 font-medium text-stone-900">{session.user.email}</dd></div></dl></div>{session.user.role !== "admin" ? <details className="mt-10 border-t border-stone-200 pt-5"><summary className="cursor-pointer text-sm font-medium text-stone-500 hover:text-stone-900">Account deletion</summary><div className="mt-4 max-w-xl rounded-2xl border border-stone-200 bg-stone-50 p-5"><p className="text-sm leading-relaxed text-stone-600">If you no longer want your account, you can schedule deletion. You will have 30 days to restore it by signing in again.</p><div className="mt-4"><DeleteAccountButton storeCredit={credit} pendingRefunds={pendingRefunds} /></div></div></details> : null}</section></div></main>;
}
