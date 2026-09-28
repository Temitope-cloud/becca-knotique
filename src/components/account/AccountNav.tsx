"use client";

import Link from "next/link";
import { Heart, LogOut, MessageSquareText, Package, ShieldCheck, UserRound, Wallet } from "lucide-react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const items = [
  { href: "/account/profile", label: "Personal info", Icon: UserRound },
  { href: "/account", label: "My orders", Icon: Package, exact: true },
  { href: "/account/requests", label: "My requests", Icon: MessageSquareText },
  { href: "/account/credit", label: "Store credit", Icon: Wallet },
  { href: "/account/wishlist", label: "Wishlist", Icon: Heart },
  { href: "/account/security", label: "Security", Icon: ShieldCheck },
];

export default function AccountNav({ name }: { name?: string | null }) {
  const pathname = usePathname();
  return (
    <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-3 lg:sticky lg:top-6">
      <div className="border-b border-stone-100 px-3 pb-4 pt-2">
        <p className="text-xs font-medium tracking-[0.14em] text-stone-400 uppercase">My account</p>
        <p className="mt-1 truncate font-semibold text-stone-900">{name || "Customer"}</p>
      </div>
      <nav className="mt-3 grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
        {items.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          return <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"}`}><Icon className="h-4 w-4" />{label}</Link>;
        })}
      </nav>
      <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="mt-4 flex w-full items-center gap-3 border-t border-stone-100 px-3 pt-4 pb-2 text-sm font-medium text-stone-500 transition hover:text-stone-900"><LogOut className="h-4 w-4" />Sign out</button>
    </aside>
  );
}
