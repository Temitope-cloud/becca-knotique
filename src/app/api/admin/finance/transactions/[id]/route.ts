import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { FinanceTransaction } from "@/lib/models/FinanceTransaction";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await connectToDatabase();

  // Only manual entries can be deleted — order-sourced ones stay for integrity.
  const txn = await FinanceTransaction.findById(id).select("source").lean<{
    source: string;
  }>();
  if (!txn) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (txn.source !== "manual") {
    return NextResponse.json(
      { error: "Auto-generated entries can't be deleted." },
      { status: 400 },
    );
  }

  await FinanceTransaction.deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
}
