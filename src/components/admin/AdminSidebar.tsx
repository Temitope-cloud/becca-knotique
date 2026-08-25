"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  TicketPercent,
  Settings,
  LogOut,
  Store,
  Menu,
  X,
  Wallet,
  Rocket,
  Newspaper,
} from "lucide-react";

const nav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Coupons", href: "/admin/coupons", icon: TicketPercent },
  { label: "Journal", href: "/admin/journal", icon: Newspaper },
  { label: "Finance", href: "/admin/finance", icon: Wallet },
  { label: "Release log", href: "/admin/releases", icon: Rocket },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar({ name }: { name?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const NavLinks = () => (
    <nav className="flex flex-1 flex-col gap-1">
      {nav.map(({ label, href, icon: Icon, exact }) => {
        const active = isActive(href, exact);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-stone-900 text-white"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* mobile top bar */}
      <div className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2 font-semibold text-stone-900">
          <Store className="h-5 w-5" /> Admin
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="rounded-lg p-2 text-stone-700 hover:bg-stone-100"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* mobile drawer */}
      {open ? (
        <div className="border-b border-stone-200 bg-white px-4 py-3 lg:hidden">
          <NavLinks />
        </div>
      ) : null}

      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-stone-200 bg-white px-4 py-6 lg:flex">
        <Link
          href="/admin"
          className="mb-8 flex items-center gap-2 px-2 text-lg font-semibold tracking-tight text-stone-900"
        >
          <Store className="h-5 w-5" />
          Becca&apos;s Admin
        </Link>

        <NavLinks />

        <div className="mt-auto border-t border-stone-100 pt-4">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
          >
            <Store className="h-[18px] w-[18px]" /> View store
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
          >
            <LogOut className="h-[18px] w-[18px]" /> Sign out
          </button>
          {name ? (
            <p className="mt-3 px-3.5 text-xs text-stone-400">Signed in as {name}</p>
          ) : null}
        </div>
      </aside>
    </>
  );
}
