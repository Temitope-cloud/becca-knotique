import "server-only";
import { connectToDatabase } from "@/lib/db";
import { Order, type IOrder, type RefundMethod } from "@/lib/models/Order";
import { FinanceTransaction } from "@/lib/models/FinanceTransaction";
import { paystackRefund } from "@/lib/paystack";
import { addStoreCredit } from "@/lib/store-credit";

export interface RefundInput {
  orderRef: string; // order number or internal reference
  amount: number; // NGN
  reason: string;
  method: RefundMethod;
  note?: string;
  adminEmail?: string;
}

export interface RefundResult {
  ok: boolean;
  error?: string;
  refundedAmount?: number;
  refundStatus?: string;
}

/** How much of an order can still be refunded (NGN). */
export function totalRefundable(order: IOrder): number {
  if (order.status !== "paid") return 0;
  return Math.max(0, Math.round(order.amount - (order.refundedAmount ?? 0)));
}

/** How much can still be refunded specifically back to Paystack (NGN). */
export function paystackRefundable(order: IOrder): number {
  const paystackPaid = Math.round(
    order.amount - (order.storeCreditApplied ?? 0),
  );
  const already = (order.refunds ?? [])
    .filter((r) => r.method === "paystack")
    .reduce((s, r) => s + r.amount, 0);
  return Math.max(0, paystackPaid - already);
}

export async function recordRefund(input: RefundInput): Promise<RefundResult> {
  await connectToDatabase();

  const order = await Order.findOne({
    $or: [{ orderNumber: input.orderRef }, { reference: input.orderRef }],
  });
  if (!order) return { ok: false, error: "Order not found." };
  if (order.status !== "paid") {
    return { ok: false, error: "Only paid orders can be refunded." };
  }

  const amount = Math.round(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Enter a refund amount greater than zero." };
  }

  const refundableNow = totalRefundable(order);
  if (amount > refundableNow) {
    return {
      ok: false,
      error: `Only ₦${refundableNow.toLocaleString()} is left to refund on this order.`,
    };
  }

  if (input.method === "store_credit" && !order.user) {
    return {
      ok: false,
      error: "Store credit can only go to a registered customer's account.",
    };
  }

  if (input.method === "paystack") {
    const cap = paystackRefundable(order);
    if (amount > cap) {
      return {
        ok: false,
        error: `Only ₦${cap.toLocaleString()} of this order was paid by card and can be refunded to Paystack.`,
      };
    }
    // Move the money first; only record it if Paystack accepts the refund.
    try {
      await paystackRefund(order.reference, amount);
    } catch (e) {
      return {
        ok: false,
        error:
          e instanceof Error
            ? `Paystack refund failed: ${e.message}`
            : "Paystack refund failed.",
      };
    }
  }

  if (input.method === "store_credit" && order.user) {
    await addStoreCredit(String(order.user), amount, {
      reason: "refund",
      description: `Refund for order ${order.orderNumber ?? order.reference}`,
      orderRef: order.orderNumber ?? order.reference,
      createdBy: input.adminEmail,
    });
  }

  // Update the order.
  const newRefunded = (order.refundedAmount ?? 0) + amount;
  order.refunds.push({
    amount,
    reason: input.reason,
    method: input.method,
    note: input.note,
    by: input.adminEmail,
    createdAt: new Date(),
  });
  order.refundedAmount = newRefunded;
  order.refundStatus = newRefunded >= order.amount ? "full" : "partial";
  await order.save();

  // Finance ledger (negative). source "manual" so multiple refunds per order
  // are allowed (the unique order+type index only applies to source "order").
  await FinanceTransaction.create({
    date: new Date(),
    description: `Refund — ${order.orderNumber ?? order.reference} (${input.method.replace("_", " ")})`,
    type: "refund",
    amount: -amount,
    reference: order.orderNumber ?? order.reference,
    source: "manual",
    order: order._id,
    notes: input.reason + (input.note ? ` — ${input.note}` : ""),
    createdBy: input.adminEmail ?? "admin",
  });

  return {
    ok: true,
    refundedAmount: newRefunded,
    refundStatus: order.refundStatus,
  };
}
