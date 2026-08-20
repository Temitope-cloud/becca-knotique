import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/lib/models/Order";

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
  const result = await Order.updateOne({ reference: id }, { $set: update });
  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
