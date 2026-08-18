import "server-only";
import { connectToDatabase } from "@/lib/db";
import { Order, type IOrder } from "@/lib/models/Order";
import { paystackVerify } from "@/lib/paystack";

/**
 * Verify an order against Paystack and update its status.
 * Safe to call multiple times (e.g. on the callback page and via webhook).
 */
export async function verifyAndSyncOrder(
  reference: string,
): Promise<IOrder | null> {
  await connectToDatabase();
  const order = await Order.findOne({ reference });
  if (!order) return null;

  // Already settled — nothing to do.
  if (order.status === "paid") return order.toObject() as IOrder;

  try {
    const result = await paystackVerify(reference);
    if (result.status === "success") {
      order.status = "paid";
      order.paidAt = new Date();
    } else if (result.status === "failed") {
      order.status = "failed";
    }
    order.paystack = result.raw;
    await order.save();
  } catch (error) {
    console.error("[verifyAndSyncOrder] error:", error);
  }

  return order.toObject() as IOrder;
}
