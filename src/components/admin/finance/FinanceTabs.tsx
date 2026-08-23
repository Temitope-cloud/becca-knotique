"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin/finance", label: "Overview", exact: true },
  { href: "/admin/finance/ledger", label: "Ledger" },
  { href: "/admin/finance/expenses", label: "Expenses" },
  { href: "/admin/finance/payroll", label: "Salary & Drawings" },
  { href: "/admin/finance/taxes", label: "Taxes" },
];

export default function FinanceTabs() {
  const pathname = usePathname();
  return (
    <div className="mb-6 flex flex-wrap gap-1.5 border-b border-stone-200 pb-3">
      {tabs.map((t) => {
        const active = t.exact
          ? pathname === t.href
          : pathname === t.href || pathname.startsWith(t.href + "/");
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              active
                ? "bg-stone-900 text-white"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
