import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { Order } from "@/lib/models/Order";
import { RefundRequest } from "@/lib/models/RefundRequest";
import { AccountDeletionFeedback } from "@/lib/models/AccountDeletionFeedback";
import { sendAccountDeletedEmail } from "@/lib/email";

export const runtime = "nodejs";

/**
 * Self-serve account deletion. Removes the user's login and personal profile,
 * but KEEPS order records for the business's finance/tax history with the
 * personal link severed (order.user -> null). Store credit is forfeited.
 */
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  // Don't let an admin lock themselves out of the store via self-delete.
  if (session.user.role === "admin") {
    return NextResponse.json(
      { error: "Admin accounts can't be deleted from here." },
      { status: 403 },
    );
  }

  // Optional, anonymous exit feedback.
  const body = await request.json().catch(() => ({}));
  const reason =
    typeof body?.reason === "string" ? body.reason.trim().slice(0, 60) : "";
  const comment =
    typeof body?.comment === "string" ? body.comment.trim().slice(0, 1000) : "";

  const userId = session.user.id;
  await connectToDatabase();

  // Record the reason before we delete anything (no personal data stored).
  const hadOrders = (await Order.countDocuments({ user: userId })) > 0;
  await AccountDeletionFeedback.create({
    reason: reason || "unspecified",
    comment: comment || undefined,
    hadOrders,
  });

  // Sever the personal link on records we keep for the business.
  await Promise.allSettled([
    Order.updateMany({ user: userId }, { $set: { user: null } }),
    RefundRequest.updateMany({ user: userId }, { $set: { user: null } }),
  ]);

  await User.deleteOne({ _id: userId });

  if (session.user.email) {
    await sendAccountDeletedEmail(session.user.email, session.user.name ?? undefined);
  }

  return NextResponse.json({ ok: true });
}
