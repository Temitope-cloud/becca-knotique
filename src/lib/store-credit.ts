import "server-only";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import {
  StoreCreditEntry,
  type IStoreCreditEntry,
  type StoreCreditReason,
} from "@/lib/models/StoreCreditEntry";

/** Current store credit balance (NGN) for a user. */
export async function getStoreCredit(userId: string): Promise<number> {
  await connectToDatabase();
  const user = await User.findById(userId).select("storeCredit").lean<{
    storeCredit?: number;
  }>();
  return Math.max(0, Math.round(user?.storeCredit ?? 0));
}

/** Add store credit and log a ledger entry. Returns the new balance. */
export async function addStoreCredit(
  userId: string,
  amount: number,
  opts: {
    reason: StoreCreditReason;
    description?: string;
    orderRef?: string;
    createdBy?: string;
  },
): Promise<number> {
  const amt = Math.round(amount);
  if (amt <= 0) return getStoreCredit(userId);
  await connectToDatabase();
  await User.updateOne({ _id: userId }, { $inc: { storeCredit: amt } });
  await StoreCreditEntry.create({
    user: userId,
    amount: amt,
    reason: opts.reason,
    description: opts.description,
    orderRef: opts.orderRef,
    createdBy: opts.createdBy,
  });
  return getStoreCredit(userId);
}

/**
 * Spend store credit atomically. Only succeeds if the balance covers `amount`,
 * so it can't be double-spent by concurrent checkouts. Returns true on success.
 */
export async function spendStoreCredit(
  userId: string,
  amount: number,
  opts: { description?: string; orderRef?: string },
): Promise<boolean> {
  const amt = Math.round(amount);
  if (amt <= 0) return true;
  await connectToDatabase();
  const res = await User.updateOne(
    { _id: userId, storeCredit: { $gte: amt } },
    { $inc: { storeCredit: -amt } },
  );
  if (res.modifiedCount === 0) return false;
  await StoreCreditEntry.create({
    user: userId,
    amount: -amt,
    reason: "spend",
    description: opts.description,
    orderRef: opts.orderRef,
  });
  return true;
}

export async function listStoreCreditEntries(
  userId: string,
  limit = 50,
): Promise<IStoreCreditEntry[]> {
  await connectToDatabase();
  return StoreCreditEntry.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<IStoreCreditEntry[]>();
}
