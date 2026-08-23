import { Info } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { listTransactions } from "@/lib/finance";
import { formatNaira } from "@/lib/money";
import FinanceTabs from "@/components/admin/finance/FinanceTabs";
import AddTransactionForm from "@/components/admin/finance/AddTransactionForm";
import LedgerTable, {
  type TxnView,
} from "@/components/admin/finance/LedgerTable";
import type { FinanceType } from "@/lib/models/FinanceTransaction";

const TAX_TYPES: { value: FinanceType; label: string }[] = [
  { value: "tax_provision", label: "Tax provision (set aside)" },
  { value: "tax_payment", label: "Tax payment (actually paid)" },
];

export default async function TaxesPage() {
  await requireAdmin();
  const [provisions, payments] = await Promise.all([
    listTransactions({ type: "tax_provision", limit: 500 }),
    listTransactions({ type: "tax_payment", limit: 500 }),
  ]);
  const provisioned = provisions.reduce((s, t) => s + Math.abs(t.amount), 0);
  const paid = payments.reduce((s, t) => s + Math.abs(t.amount), 0);
  const remaining = Math.max(0, provisioned - paid);

  const merged = [...provisions, ...payments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const rows: TxnView[] = merged.map((t) => ({
    id: t._id.toString(),
    date: new Date(t.date).toISOString(),
    description: t.description,
    type: t.type,
    amount: t.amount,
    category: t.category,
    source: t.source,
  }));

  return (
    <div className="px-5 py-8 sm:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
        Taxes
      </h1>
      <p className="mt-1 mb-6 text-sm text-stone-500">
        Set money aside for tax as an estimate, then record what you actually
        pay.
      </p>

      <FinanceTabs />

      <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        These are <strong>estimates / provisions</strong> to help you save ahead
        — not legally confirmed tax owed. Always confirm actual obligations with
        a qualified accountant.
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-500">Provisioned (est.)</p>
          <p className="mt-1 text-2xl font-semibold text-stone-900">
            {formatNaira(provisioned)}
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-500">Paid</p>
          <p className="mt-1 text-2xl font-semibold text-stone-900">
            {formatNaira(paid)}
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-500">Remaining set-aside</p>
          <p className="mt-1 text-2xl font-semibold text-stone-900">
            {formatNaira(remaining)}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <AddTransactionForm
          types={TAX_TYPES}
          defaultType="tax_provision"
          heading="Add tax entry"
        />
      </div>

      <LedgerTable txns={rows} emptyText="No tax entries yet." />
    </div>
  );
}
