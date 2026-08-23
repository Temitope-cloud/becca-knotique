import "server-only";
import { connectToDatabase } from "@/lib/db";
import {
  FinanceTransaction,
  type FinanceType,
  type IFinanceTransaction,
} from "@/lib/models/FinanceTransaction";
import { Product } from "@/lib/models/Product";
import type { IOrder } from "@/lib/models/Order";

/** Types that represent money coming IN (stored as a positive amount). */
const INFLOW_TYPES: FinanceType[] = ["revenue", "other_income"];

/** Non-cash types — real profit/reserve concepts, not actual cash movements. */
const NON_CASH_TYPES: FinanceType[] = ["cogs", "tax_provision"];

export function isInflow(type: FinanceType): boolean {
  return INFLOW_TYPES.includes(type);
}

/** Convert a user-entered positive magnitude + type into a signed amount. */
export function signedAmount(type: FinanceType, magnitude: number): number {
  const m = Math.abs(Math.round(magnitude));
  return isInflow(type) ? m : -m;
}

export const TYPE_LABELS: Record<FinanceType, string> = {
  revenue: "Revenue",
  paystack_fee: "Paystack fee",
  cogs: "Cost of goods",
  expense: "Operating expense",
  salary: "Owner salary",
  drawing: "Owner drawing",
  tax_provision: "Tax provision",
  tax_payment: "Tax payment",
  refund: "Refund",
  other_income: "Other income",
  other_expense: "Other expense",
};

/**
 * Create the finance ledger entries for a paid order — revenue, the real
 * Paystack fee, and COGS from product costs. Idempotent: the unique
 * (order, type) index means re-running is safe.
 */
export async function createOrderFinanceEntries(order: IOrder): Promise<void> {
  await connectToDatabase();

  const orderId = order._id;
  const ref = order.orderNumber || order.reference;

  // Real Paystack fee (kobo) from the stored transaction data → naira.
  const feeKobo = Number(
    (order.paystack as { fees?: number } | undefined)?.fees ?? 0,
  );
  const fee = Math.round(feeKobo / 100);

  // COGS from configured product costs.
  const slugs = order.items.map((i) => i.slug);
  const products = await Product.find({ slug: { $in: slugs } })
    .select("slug materialCost packagingCost")
    .lean<{ slug: string; materialCost?: number; packagingCost?: number }[]>();
  const costBySlug = new Map(products.map((p) => [p.slug, p]));
  let cogs = 0;
  for (const item of order.items) {
    const c = costBySlug.get(item.slug);
    const unit = (c?.materialCost ?? 0) + (c?.packagingCost ?? 0);
    cogs += unit * item.quantity;
  }

  const entries: Array<Partial<IFinanceTransaction>> = [
    {
      date: order.paidAt ?? new Date(),
      description: `Order ${ref}`,
      type: "revenue",
      amount: Math.round(order.amount),
      reference: ref,
      source: "order",
      order: orderId as unknown as IFinanceTransaction["order"],
      createdBy: "system",
    },
  ];

  if (fee > 0) {
    entries.push({
      date: order.paidAt ?? new Date(),
      description: `Paystack fee — ${ref}`,
      type: "paystack_fee",
      amount: -fee,
      reference: ref,
      source: "order",
      order: orderId as unknown as IFinanceTransaction["order"],
      createdBy: "system",
    });
  }

  if (cogs > 0) {
    entries.push({
      date: order.paidAt ?? new Date(),
      description: `Cost of goods — ${ref}`,
      type: "cogs",
      amount: -Math.round(cogs),
      reference: ref,
      source: "order",
      order: orderId as unknown as IFinanceTransaction["order"],
      createdBy: "system",
    });
  }

  // Insert individually + ignore duplicate-key errors (idempotent per order+type).
  await Promise.allSettled(
    entries.map((e) => FinanceTransaction.create(e).catch(() => null)),
  );
}

export interface FinanceOverview {
  grossRevenue: number;
  refunds: number;
  paystackFees: number;
  netRevenue: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  ownerSalary: number;
  ownerDrawings: number;
  taxProvision: number;
  taxPaid: number;
  otherIncome: number;
  netProfit: number;
  availableCash: number;
  profitMargin: number;
  txnCount: number;
}

function emptyOverview(): FinanceOverview {
  return {
    grossRevenue: 0,
    refunds: 0,
    paystackFees: 0,
    netRevenue: 0,
    cogs: 0,
    grossProfit: 0,
    operatingExpenses: 0,
    ownerSalary: 0,
    ownerDrawings: 0,
    taxProvision: 0,
    taxPaid: 0,
    otherIncome: 0,
    netProfit: 0,
    availableCash: 0,
    profitMargin: 0,
    txnCount: 0,
  };
}

/** Aggregate the ledger over a date range into the overview figures. */
export async function computeOverview(
  from?: Date,
  to?: Date,
): Promise<FinanceOverview> {
  await connectToDatabase();
  const q: Record<string, unknown> = {};
  if (from || to) {
    q.date = {
      ...(from ? { $gte: from } : {}),
      ...(to ? { $lte: to } : {}),
    };
  }
  const txns = await FinanceTransaction.find(q)
    .select("type amount")
    .lean<{ type: FinanceType; amount: number }[]>();

  const o = emptyOverview();
  o.txnCount = txns.length;

  const sumAbs = (t: FinanceType) =>
    txns.filter((x) => x.type === t).reduce((s, x) => s + Math.abs(x.amount), 0);

  o.grossRevenue = sumAbs("revenue");
  o.refunds = sumAbs("refund");
  o.paystackFees = sumAbs("paystack_fee");
  o.cogs = sumAbs("cogs");
  o.operatingExpenses = sumAbs("expense") + sumAbs("other_expense");
  o.ownerSalary = sumAbs("salary");
  o.ownerDrawings = sumAbs("drawing");
  o.taxProvision = sumAbs("tax_provision");
  o.taxPaid = sumAbs("tax_payment");
  o.otherIncome = sumAbs("other_income");

  o.netRevenue = o.grossRevenue - o.refunds;
  o.grossProfit = o.netRevenue - o.cogs;
  o.netProfit =
    o.grossProfit +
    o.otherIncome -
    o.paystackFees -
    o.operatingExpenses -
    o.ownerSalary -
    o.taxProvision;

  // Available cash = sum of every cash-affecting movement (signed).
  o.availableCash = txns
    .filter((x) => !NON_CASH_TYPES.includes(x.type))
    .reduce((s, x) => s + x.amount, 0);

  o.profitMargin =
    o.grossRevenue > 0 ? (o.netProfit / o.grossRevenue) * 100 : 0;

  return o;
}

export async function listTransactions(opts?: {
  type?: FinanceType;
  from?: Date;
  to?: Date;
  limit?: number;
}): Promise<IFinanceTransaction[]> {
  await connectToDatabase();
  const q: Record<string, unknown> = {};
  if (opts?.type) q.type = opts.type;
  if (opts?.from || opts?.to) {
    q.date = {
      ...(opts.from ? { $gte: opts.from } : {}),
      ...(opts.to ? { $lte: opts.to } : {}),
    };
  }
  return FinanceTransaction.find(q)
    .sort({ date: -1, createdAt: -1 })
    .limit(opts?.limit ?? 500)
    .lean<IFinanceTransaction[]>();
}
