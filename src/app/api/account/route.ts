import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { DELETION_GRACE_DAYS } from "@/lib/account-deletion";
import { sendAccountDeletionScheduledEmail } from "@/lib/email";

export const runtime = "nodejs";

/**
 * Self-serve account deletion — SOFT delete with a grace period. Marks the
 * account for deletion and signs the user out; a daily job purges accounts
 * older than DELETION_GRACE_DAYS. Logging back in before then cancels it and
 * restores the account (handled in the auth callbacks).
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

  // Optional, anonymous exit feedback (kept on the user, written to the
  // anonymous feedback log only when the purge actually happens).
  const body = await request.json().catch(() => ({}));
  const reason =
    typeof body?.reason === "string" ? body.reason.trim().slice(0, 60) : "";
  const comment =
    typeof body?.comment === "string" ? body.comment.trim().slice(0, 1000) : "";

  await connectToDatabase();
  await User.updateOne(
    { _id: session.user.id },
    {
      $set: {
        deletionScheduledAt: new Date(),
        deletionReason: reason || "unspecified",
        deletionComment: comment || undefined,
      },
    },
  );

  if (session.user.email) {
    const purgeDate = new Date(
      Date.now() + DELETION_GRACE_DAYS * 24 * 60 * 60 * 1000,
    ).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    await sendAccountDeletionScheduledEmail(
      session.user.email,
      session.user.name ?? undefined,
      purgeDate,
    );
  }

  return NextResponse.json({ ok: true, graceDays: DELETION_GRACE_DAYS });
}
