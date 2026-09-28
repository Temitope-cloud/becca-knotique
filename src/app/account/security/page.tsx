import { redirect } from "next/navigation";
import { auth } from "@/auth";
import TwoFactorSettings from "@/components/account/TwoFactorSettings";

export const metadata = { title: "Account security", robots: { index: false, follow: false } };

export default async function AccountSecurityPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account/security");

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Account security</h1>
      <p className="mt-2 text-stone-600">Manage extra protection for your Becca&apos;s Knotique account.</p>
      <div className="mt-8"><TwoFactorSettings /></div>
    </main>
  );
}
