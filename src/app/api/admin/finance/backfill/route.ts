import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { Order, type IOrder } from "@/lib/models/Order";
import { createOrderFinanceEntries } from "@/lib/finance";

export const runtime = "nodejs";

/**
 * Backfill finance ledger entries for orders that were paid before the finance
 * module existed. Idempotent — createOrderFinanceEntries won't duplicate entries
 * (unique {order,type} index), so this is safe to run repeatedly.
 */
export async function POST() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const paidOrders = await Order.find({ status: "paid" }).lean<IOrder[]>();

  let processed = 0;
  for (const order of paidOrders) {
    // eslint-disable-next-line no-await-in-loop
    await createOrderFinanceEntries(order);
    processed += 1;
  }

  return NextResponse.json({ ok: true, processed });
}
