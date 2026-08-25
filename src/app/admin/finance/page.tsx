import Link from "next/link";
import { Info } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import Tooltip from "@/components/ui/Tooltip";
import { computeOverview, type FinanceOverview } from "@/lib/finance";
import { formatNaira } from "@/lib/money";
import FinanceTabs from "@/components/admin/finance/FinanceTabs";
import SyncOrdersButton from "@/components/admin/finance/SyncOrdersButton";

type Period =
  | "today"
  | "week"
  | "month"
  | "last-month"
  | "year"
  | "all";

const PERIODS: { key: Period; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "last-month", label: "Last month" },
  { key: "year", label: "This year" },
  { key: "all", label: "All time" },
];

function ranges(period: Period): {
  from?: Date;
  to?: Date;
  prevFrom?: Date;
  prevTo?: Date;
} {
  const now = new Date();
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());
  switch (period) {
    case "today": {
      const from = startOfDay(now);
      const prevFrom = new Date(from);
      prevFrom.setDate(prevFrom.getDate() - 1);
      return { from, to: now, prevFrom, prevTo: from };
    }
    case "week": {
      // Calendar week starting Sunday (getDay(): 0 = Sunday).
      const from = startOfDay(now);
      from.setDate(from.getDate() - now.getDay());
      const prevFrom = new Date(from);
      prevFrom.setDate(prevFrom.getDate() - 7);
      return { from, to: now, prevFrom, prevTo: from };
    }
    case "month": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      const prevFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return { from, to: now, prevFrom, prevTo: from };
    }
    case "last-month": {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 1);
      const prevFrom = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return { from, to, prevFrom, prevTo: from };
    }
    case "year": {
      const from = new Date(now.getFullYear(), 0, 1);
      const prevFrom = new Date(now.getFullYear() - 1, 0, 1);
      return { from, to: now, prevFrom, prevTo: from };
    }
    default:
      return {};
  }
}

function Delta({ now, prev }: { now: number; prev: number }) {
  if (prev === 0) return null;
  const pct = Math.round(((now - prev) / Math.abs(prev)) * 100);
  const up = pct >= 0;
  return (
    <span
      className={`text-xs font-medium ${up ? "text-emerald-600" : "text-rose-600"}`}
    >
      {up ? "▲" : "▼"} {Math.abs(pct)}% vs previous
    </span>
  );
}

export default async function FinanceOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  await requireAdmin();
  const { period: rawPeriod } = await searchParams;
  const period: Period = (
    PERIODS.some((p) => p.key === rawPeriod) ? rawPeriod : "month"
  ) as Period;

  const { from, to, prevFrom, prevTo } = ranges(period);
  const [o, prev] = await Promise.all([
    computeOverview(from, to),
    prevFrom ? computeOverview(prevFrom, prevTo) : Promise.resolve(null),
  ]);

  const money = (n: number) => formatNaira(n);

  const primary: {
    label: string;
    value: string;
    hint?: string;
    delta?: [number, number];
    accent?: string;
  }[] = [
    {
      label: "Gross revenue",
      value: money(o.grossRevenue),
      hint: "Money customers paid",
      delta: prev ? [o.grossRevenue, prev.grossRevenue] : undefined,
    },
    {
      label: "Net profit",
      value: money(o.netProfit),
      hint: "What the business actually made",
      delta: prev ? [o.netProfit, prev.netProfit] : undefined,
      accent: o.netProfit >= 0 ? "text-emerald-700" : "text-rose-700",
    },
    {
      label: "Available cash",
      value: money(o.availableCash),
      hint: "Actual money movements in − out",
    },
    {
      label: "Profit margin",
      value: `${o.profitMargin.toFixed(1)}%`,
      hint: "Net profit ÷ gross revenue",
    },
  ];

  const breakdown: {
    label: string;
    value: string;
    sign?: "in" | "out";
    hint: string;
  }[] = [
    {
      label: "Gross revenue",
      value: money(o.grossRevenue),
      sign: "in",
      hint: "All the money customers paid, before any costs are taken out.",
    },
    {
      label: "Refunds",
      value: money(o.refunds),
      sign: "out",
      hint: "Money paid back to customers for returns or cancellations.",
    },
    {
      label: "Paystack fees",
      value: money(o.paystackFees),
      sign: "out",
      hint: "What Paystack charged to process the payments.",
    },
    {
      label: "Net revenue",
      value: money(o.netRevenue),
      hint: "Revenue left after refunds. This is your real sales figure.",
    },
    {
      label: "Cost of goods (COGS)",
      value: money(o.cogs),
      sign: "out",
      hint: "What it cost to make the items sold — yarn, materials, packaging.",
    },
    {
      label: "Gross profit",
      value: money(o.grossProfit),
      hint: "Net revenue minus the cost of making the items. Before running costs.",
    },
    {
      label: "Operating expenses",
      value: money(o.operatingExpenses),
      sign: "out",
      hint: "Costs of running the business — data, transport, ads, tools, etc.",
    },
    {
      label: "Owner salary",
      value: money(o.ownerSalary),
      sign: "out",
      hint: "What you paid yourself for your work. Not the same as profit.",
    },
    {
      label: "Tax provision (estimate)",
      value: money(o.taxProvision),
      sign: "out",
      hint: "Money set aside for tax. An estimate to confirm with an accountant.",
    },
    {
      label: "Net profit",
      value: money(o.netProfit),
      hint: "What the business actually made after everything above.",
    },
  ];

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
            Finance
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Money in is not the same as money made. Here&apos;s the real picture.
          </p>
        </div>
        <SyncOrdersButton />
      </div>

      <FinanceTabs />

      {/* period filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <Link
            key={p.key}
            href={`/admin/finance?period=${p.key}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              period === p.key
                ? "bg-stone-900 text-white"
                : "border border-stone-300 bg-white text-stone-600 hover:border-stone-400"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </div>

      {/* headline cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {primary.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-stone-200 bg-white p-5"
          >
            <p className="text-sm text-stone-500">{c.label}</p>
            <p
              className={`mt-2 text-2xl font-semibold tracking-tight ${c.accent ?? "text-stone-900"}`}
            >
              {c.value}
            </p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="text-xs text-stone-400">{c.hint}</span>
              {c.delta ? <Delta now={c.delta[0]} prev={c.delta[1]} /> : null}
            </div>
          </div>
        ))}
      </div>

      {/* breakdown + owner */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-semibold text-stone-900">
            From revenue to profit
          </h2>
          <ul className="mt-4 divide-y divide-stone-100">
            {breakdown.map((b) => {
              const strong =
                b.label === "Net profit" ||
                b.label === "Gross profit" ||
                b.label === "Net revenue";
              return (
                <li
                  key={b.label}
                  className={`flex items-center justify-between py-2.5 text-sm ${
                    strong ? "font-semibold text-stone-900" : "text-stone-600"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {b.label}
                    <Tooltip label={b.hint} wide>
                      <Info className="h-3.5 w-3.5 text-stone-400" />
                    </Tooltip>
                  </span>
                  <span
                    className={
                      b.sign === "out"
                        ? "text-stone-500"
                        : strong
                          ? "text-stone-900"
                          : "text-stone-700"
                    }
                  >
                    {b.sign === "out" ? "− " : ""}
                    {b.value}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="font-semibold text-stone-900">Owner</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">Salary paid</span>
                <span className="font-medium text-stone-900">
                  {money(o.ownerSalary)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Drawings</span>
                <span className="font-medium text-stone-900">
                  {money(o.ownerDrawings)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="font-semibold text-stone-900">Tax provision</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">Set aside (est.)</span>
                <span className="font-medium text-stone-900">
                  {money(o.taxProvision)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Paid</span>
                <span className="font-medium text-stone-900">
                  {money(o.taxPaid)}
                </span>
              </div>
              <div className="flex justify-between border-t border-stone-100 pt-2">
                <span className="text-stone-500">Remaining</span>
                <span className="font-semibold text-stone-900">
                  {money(Math.max(0, o.taxProvision - o.taxPaid))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-6 flex items-start gap-2 rounded-xl bg-stone-100 px-4 py-3 text-xs text-stone-500">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        Tax provision is an estimate to set aside — not a legally confirmed
        amount. Confirm actual obligations with an accountant. Sales, Paystack
        fees, and COGS are recorded automatically when an order is paid.
      </p>
    </div>
  );
}
