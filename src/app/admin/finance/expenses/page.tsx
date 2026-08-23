import { requireAdmin } from "@/lib/admin-auth";
import { listTransactions } from "@/lib/finance";
import { formatNaira } from "@/lib/money";
import FinanceTabs from "@/components/admin/finance/FinanceTabs";
import AddTransactionForm from "@/components/admin/finance/AddTransactionForm";
import LedgerTable, {
  type TxnView,
} from "@/components/admin/finance/LedgerTable";
import type { FinanceType } from "@/lib/models/FinanceTransaction";

const EXPENSE_CATEGORIES = [
  "Yarn",
  "Crochet tools",
  "Fabric",
  "Buttons",
  "Zippers",
  "Thread",
  "Other production materials",
  "Boxes",
  "Bags",
  "Thank-you cards",
  "Stickers",
  "Labels",
  "Electricity",
  "Internet",
  "Workspace",
  "Equipment",
  "Maintenance",
  "Advertising",
  "Influencers",
  "Photography",
  "Videography",
  "Content creation",
  "Dispatch",
  "Courier",
  "Shipping materials",
  "Domain",
  "Hosting",
  "Software subscriptions",
  "Miscellaneous",
];

const EXPENSE_TYPES: { value: FinanceType; label: string }[] = [
  { value: "expense", label: "Operating expense" },
  { value: "other_expense", label: "Other expense" },
];

export default async function ExpensesPage() {
  await requireAdmin();
  const [expenses, other] = await Promise.all([
    listTransactions({ type: "expense", limit: 500 }),
    listTransactions({ type: "other_expense", limit: 500 }),
  ]);
  const merged = [...expenses, ...other].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const total = merged.reduce((s, t) => s + Math.abs(t.amount), 0);

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Expenses
        </h1>
        <span className="text-sm text-stone-500">
          Total recorded:{" "}
          <span className="font-semibold text-stone-900">
            {formatNaira(total)}
          </span>
        </span>
      </div>
      <p className="mt-1 mb-6 text-sm text-stone-500">
        Business running costs — production materials, packaging, delivery,
        marketing, tools and subscriptions.
      </p>

      <FinanceTabs />

      <div className="mb-6">
        <AddTransactionForm
          types={EXPENSE_TYPES}
          defaultType="expense"
          categories={EXPENSE_CATEGORIES}
          heading="Add expense"
        />
      </div>

      <LedgerTable txns={rows} emptyText="No expenses recorded yet." />
    </div>
  );
}
