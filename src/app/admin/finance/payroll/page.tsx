import { requireAdmin } from "@/lib/admin-auth";
import { listTransactions } from "@/lib/finance";
import { formatNaira } from "@/lib/money";
import FinanceTabs from "@/components/admin/finance/FinanceTabs";
import AddTransactionForm from "@/components/admin/finance/AddTransactionForm";
import LedgerTable, {
  type TxnView,
} from "@/components/admin/finance/LedgerTable";
import type { FinanceType } from "@/lib/models/FinanceTransaction";

const PAYROLL_TYPES: { value: FinanceType; label: string }[] = [
  { value: "salary", label: "Owner salary" },
  { value: "drawing", label: "Owner drawing" },
];

export default async function PayrollPage() {
  await requireAdmin();
  const [salary, drawing] = await Promise.all([
    listTransactions({ type: "salary", limit: 500 }),
    listTransactions({ type: "drawing", limit: 500 }),
  ]);

  const yearStart = new Date(new Date().getFullYear(), 0, 1).getTime();
  const salaryYTD = salary
    .filter((t) => new Date(t.date).getTime() >= yearStart)
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  const drawingsYTD = drawing
    .filter((t) => new Date(t.date).getTime() >= yearStart)
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  const merged = [...salary, ...drawing].sort(
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
        Salary &amp; Drawings
      </h1>
      <p className="mt-1 mb-6 text-sm text-stone-500">
        Pay yourself a defined <strong>salary</strong>, and record any money you
        take out beyond that as a <strong>drawing</strong>. They&apos;re kept
        separate — neither is a business expense.
      </p>

      <FinanceTabs />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-500">Salary paid (this year)</p>
          <p className="mt-1 text-2xl font-semibold text-stone-900">
            {formatNaira(salaryYTD)}
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-500">Drawings (this year)</p>
          <p className="mt-1 text-2xl font-semibold text-stone-900">
            {formatNaira(drawingsYTD)}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <AddTransactionForm
          types={PAYROLL_TYPES}
          defaultType="salary"
          heading="Record salary / drawing"
        />
      </div>

      <LedgerTable txns={rows} emptyText="No salary or drawings recorded yet." />
    </div>
  );
}
