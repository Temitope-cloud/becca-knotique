import "server-only";
import { connectToDatabase } from "@/lib/db";
import { Order, type IOrder } from "@/lib/models/Order";
import { Product } from "@/lib/models/Product";
import { Coupon } from "@/lib/models/Coupon";
import { paystackVerify } from "@/lib/paystack";
import { sendOrderEmails } from "@/lib/email";

/** Reduce stock levels and bump coupon usage once, when an order is paid. */
async function applyPaidSideEffects(order: IOrder): Promise<void> {
  await Promise.allSettled(
    order.items.map((item) =>
      Product.updateOne(
        { slug: item.slug },
        {
          $inc: { stockCount: -item.quantity },
        },
      ),
    ),
  );
  // Any product that dropped to/below zero is marked out of stock.
  await Product.updateMany(
    { stockCount: { $lte: 0 } },
    { $set: { inStock: false } },
  );
  if (order.couponCode) {
    await Coupon.updateOne(
      { code: order.couponCode },
      { $inc: { timesUsed: 1 } },
    );
  }
}

/**
 * Atomically flip an order pending -> paid. Returns true only for the caller
 * that actually performed the transition, so confirmation emails are sent once
 * even though both the webhook and the return page call this.
 */
export async function markOrderPaid(
  reference: string,
  paystackData?: Record<string, unknown>,
): Promise<boolean> {
  await connectToDatabase();
  // { new: false } returns the PRE-update doc, or null if nothing matched
  // (i.e. it was already paid) — that tells us whether we are the one flipping it.
  const previous = await Order.findOneAndUpdate(
    { reference, status: { $ne: "paid" } },
    { status: "paid", paidAt: new Date(), ...(paystackData ? { paystack: paystackData } : {}) },
    { new: false },
  );

  if (!previous) return false; // already paid (or missing) — no duplicate email

  const fresh = await Order.findOne({ reference }).lean<IOrder>();
  if (fresh) {
    await applyPaidSideEffects(fresh);
    await sendOrderEmails(fresh);
  }
  return true;
}

/**
 * Verify an order against Paystack and sync its status.
 * Safe to call multiple times (return page + webhook).
 */
export async function verifyAndSyncOrder(
  reference: string,
): Promise<IOrder | null> {
  await connectToDatabase();
  const existing = await Order.findOne({ reference });
  if (!existing) return null;
  if (existing.status === "paid") return existing.toObject() as IOrder;

  try {
    const result = await paystackVerify(reference);
    if (result.status === "success") {
      await markOrderPaid(reference, result.raw);
    } else if (result.status === "failed") {
      existing.status = "failed";
      existing.paystack = result.raw;
      await existing.save();
    }
  } catch (error) {
    console.error("[verifyAndSyncOrder] error:", error);
  }

  const fresh = await Order.findOne({ reference }).lean<IOrder>();
  return fresh;
}
