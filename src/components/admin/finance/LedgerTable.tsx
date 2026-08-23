import { formatNaira } from "@/lib/money";
import { TYPE_LABELS } from "@/lib/finance";
import type { FinanceType } from "@/lib/models/FinanceTransaction";
import DeleteTxnButton from "./DeleteTxnButton";

export interface TxnView {
  id: string;
  date: string; // ISO
  description: string;
  type: FinanceType;
  amount: number; // signed NGN
  category?: string;
  source: string;
}

const typeStyles: Partial<Record<FinanceType, string>> = {
  revenue: "bg-emerald-100 text-emerald-800",
  other_income: "bg-emerald-100 text-emerald-800",
  paystack_fee: "bg-stone-200 text-stone-700",
  cogs: "bg-amber-100 text-amber-800",
  expense: "bg-amber-100 text-amber-800",
  other_expense: "bg-amber-100 text-amber-800",
  salary: "bg-blue-100 text-blue-800",
  drawing: "bg-purple-100 text-purple-800",
  tax_provision: "bg-rose-100 text-rose-800",
  tax_payment: "bg-rose-100 text-rose-800",
  refund: "bg-rose-100 text-rose-800",
};

export default function LedgerTable({
  txns,
  emptyText = "No entries yet.",
}: {
  txns: TxnView[];
  emptyText?: string;
}) {
  if (txns.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center text-sm text-stone-500">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-stone-200 bg-stone-50 text-xs tracking-wide text-stone-500 uppercase">
          <tr>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Description</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 text-right font-medium">Amount</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {txns.map((t) => (
            <tr key={t.id} className="border-b border-stone-100 last:border-0">
              <td className="px-4 py-3 whitespace-nowrap text-stone-500">
                {new Date(t.date).toLocaleDateString("en-NG", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
              <td className="px-4 py-3 text-stone-900">
                {t.description}
                {t.category ? (
                  <span className="ml-1 text-xs text-stone-400">
                    · {t.category}
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    typeStyles[t.type] ?? "bg-stone-100 text-stone-600"
                  }`}
                >
                  {TYPE_LABELS[t.type]}
                </span>
              </td>
              <td
                className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${
                  t.amount >= 0 ? "text-emerald-700" : "text-stone-900"
                }`}
              >
                {t.amount >= 0 ? "+" : "−"}
                {formatNaira(Math.abs(t.amount))}
              </td>
              <td className="px-4 py-3 text-right">
                {t.source === "manual" ? <DeleteTxnButton id={t.id} /> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
