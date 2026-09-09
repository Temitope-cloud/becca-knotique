import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { Order, type IOrder } from "@/lib/models/Order";
import { sendOrderStatusEmail, sendOrderCancelledEmail } from "@/lib/email";

export const runtime = "nodejs";

const schema = z.object({
  status: z.enum(["pending", "paid", "failed", "cancelled"]).optional(),
  fulfillmentStatus: z
    .enum(["unfulfilled", "processing", "shipped", "delivered"])
    .optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  }

  const update: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.status === "paid") update.paidAt = new Date();

  await connectToDatabase();
  // Load first so we can tell what actually changed and email only on real
  // transitions (not when re-saving the same status).
  const before = await Order.findOne({ reference: id }).lean<IOrder>();
  if (!before) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  await Order.updateOne({ reference: id }, { $set: update });
  const after = await Order.findOne({ reference: id }).lean<IOrder>();

  // Notify the customer on meaningful changes (emails no-op until Resend is set).
  if (after) {
    const fulfillmentChanged =
      parsed.data.fulfillmentStatus &&
      parsed.data.fulfillmentStatus !== before.fulfillmentStatus;
    if (
      fulfillmentChanged &&
      (after.fulfillmentStatus === "processing" ||
        after.fulfillmentStatus === "shipped" ||
        after.fulfillmentStatus === "delivered")
    ) {
      await sendOrderStatusEmail(after, after.fulfillmentStatus);
    }

    if (parsed.data.status === "cancelled" && before.status !== "cancelled") {
      await sendOrderCancelledEmail(after);
    }
  }

  return NextResponse.json({ ok: true });
}
