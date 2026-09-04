import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { Order, type IOrder } from "@/lib/models/Order";
import { RefundRequest } from "@/lib/models/RefundRequest";
import { totalRefundable } from "@/lib/refunds";

export const runtime = "nodejs";

const schema = z.object({
  orderRef: z.string().min(1),
  reason: z.string().min(2).max(200),
  note: z.string().max(1000).optional(),
  photos: z.array(z.string().url()).max(6).optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "Please sign in to request a refund." },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please pick a reason and try again." },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const order = await Order.findOne({
    $or: [
      { orderNumber: parsed.data.orderRef },
      { reference: parsed.data.orderRef },
    ],
  }).lean<IOrder>();

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // Must belong to the signed-in customer.
  const owns =
    String(order.user ?? "") === session.user.id ||
    order.email === (session.user.email ?? "").toLowerCase();
  if (!owns) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.status !== "paid") {
    return NextResponse.json(
      { error: "Only paid orders can be refunded." },
      { status: 400 },
    );
  }

  const refundable = totalRefundable(order);
  if (refundable <= 0) {
    return NextResponse.json(
      { error: "This order has already been fully refunded." },
      { status: 400 },
    );
  }

  // One open request per order at a time.
  const existing = await RefundRequest.findOne({
    order: order._id,
    status: "pending",
  }).lean();
  if (existing) {
    return NextResponse.json(
      { error: "You already have a refund request being reviewed for this order." },
      { status: 409 },
    );
  }

  await RefundRequest.create({
    order: order._id,
    orderNumber: order.orderNumber ?? order.reference,
    orderReference: order.reference,
    user: order.user ?? session.user.id,
    email: order.email,
    amount: refundable,
    reason: parsed.data.reason,
    note: parsed.data.note,
    photos: parsed.data.photos ?? [],
    status: "pending",
  });

  return NextResponse.json({ ok: true });
}
