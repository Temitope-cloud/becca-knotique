import { requireAdmin } from "@/lib/admin-auth";
import { listTransactions } from "@/lib/finance";
import FinanceTabs from "@/components/admin/finance/FinanceTabs";
import AddTransactionForm from "@/components/admin/finance/AddTransactionForm";
import LedgerTable, {
  type TxnView,
} from "@/components/admin/finance/LedgerTable";
import type { FinanceType } from "@/lib/models/FinanceTransaction";

const ALL_TYPES: { value: FinanceType; label: string }[] = [
  { value: "revenue", label: "Revenue" },
  { value: "other_income", label: "Other income" },
  { value: "expense", label: "Operating expense" },
  { value: "cogs", label: "Cost of goods" },
  { value: "paystack_fee", label: "Paystack fee" },
  { value: "salary", label: "Owner salary" },
  { value: "drawing", label: "Owner drawing" },
  { value: "tax_provision", label: "Tax provision" },
  { value: "tax_payment", label: "Tax payment" },
  { value: "refund", label: "Refund" },
  { value: "other_expense", label: "Other expense" },
];

export default async function LedgerPage() {
  await requireAdmin();
  const txns = await listTransactions({ limit: 500 });
  const rows: TxnView[] = txns.map((t) => ({
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
        Ledger
      </h1>
      <p className="mt-1 mb-6 text-sm text-stone-500">
        Every money movement in the business. Sales, fees and COGS are added
        automatically; add anything else manually.
      </p>

      <FinanceTabs />

      <div className="mb-6">
        <AddTransactionForm
          types={ALL_TYPES}
          defaultType="expense"
          heading="Add manual entry"
        />
      </div>

      <LedgerTable txns={rows} />
    </div>
  );
}
