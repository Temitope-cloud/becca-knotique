import "server-only";
import { connectToDatabase } from "@/lib/db";
import { User, type IUser } from "@/lib/models/User";
import { Order } from "@/lib/models/Order";
import { RefundRequest } from "@/lib/models/RefundRequest";
import { AccountDeletionFeedback } from "@/lib/models/AccountDeletionFeedback";
import { sendAccountDeletedEmail } from "@/lib/email";

/** How long a customer can change their mind before the account is purged. */
export const DELETION_GRACE_DAYS = 30;

/**
 * Permanently remove one user. Keeps order records for finance/tax with the
 * personal link severed, and records the (anonymous) exit reason at this point
 * so cancelled deletions never pollute the feedback.
 */
export async function purgeUser(user: IUser): Promise<void> {
  const userId = user._id;
  const hadOrders = (await Order.countDocuments({ user: userId })) > 0;

  await AccountDeletionFeedback.create({
    reason: user.deletionReason || "unspecified",
    comment: user.deletionComment || undefined,
    hadOrders,
  });

  await Promise.allSettled([
    Order.updateMany({ user: userId }, { $set: { user: null } }),
    RefundRequest.updateMany({ user: userId }, { $set: { user: null } }),
  ]);

  await User.deleteOne({ _id: userId });

  if (user.email) {
    await sendAccountDeletedEmail(user.email, user.name);
  }
}

/**
 * Purge every account whose 30-day grace period has elapsed. Returns how many
 * were removed. Safe to run repeatedly (idempotent).
 */
export async function purgeDueAccounts(): Promise<number> {
  await connectToDatabase();
  const cutoff = new Date(
    Date.now() - DELETION_GRACE_DAYS * 24 * 60 * 60 * 1000,
  );
  const due = await User.find({
    deletionScheduledAt: { $ne: null, $lte: cutoff },
    role: { $ne: "admin" },
  }).lean<IUser[]>();

  let count = 0;
  for (const user of due) {
    await purgeUser(user);
    count += 1;
  }
  return count;
}
