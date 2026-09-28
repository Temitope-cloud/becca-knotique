import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AccountNav from "@/components/account/AccountNav";
import TwoFactorSettings from "@/components/account/TwoFactorSettings";

export const metadata = { title: "Account security", robots: { index: false, follow: false } };

export default async function AccountSecurityPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account/security");

  return <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12"><div className="mb-7"><p className="text-xs font-semibold tracking-[0.18em] text-stone-400 uppercase">Becca&apos;s Knotique</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">My account</h1></div><div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]"><AccountNav name={session.user.name} /><section><h2 className="text-2xl font-semibold tracking-tight text-stone-900">Security</h2><p className="mt-1 text-sm text-stone-500">Manage extra protection for your account.</p><div className="mt-5 max-w-2xl"><TwoFactorSettings /></div></section></div></main>;
}
