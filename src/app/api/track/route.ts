import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { Order, type IOrder } from "@/lib/models/Order";

export const runtime = "nodejs";

/**
 * Order lookup for the tracking page. To avoid orders being enumerable by
 * reference alone, the caller must EITHER supply the matching email OR be signed
 * in as the order's owner. Returns only what the timeline needs.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const reference =
    typeof body?.reference === "string" ? body.reference.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!reference) {
    return NextResponse.json(
      { found: false, error: "Enter your order number." },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const order = await Order.findOne({ reference }).lean<IOrder>();

  const session = await auth();
  const ownsByAuth =
    !!session?.user &&
    !!order &&
    (session.user.email?.toLowerCase() === order.email ||
      String(order.user ?? "") === session.user.id);
  const ownsByEmail = !!order && !!email && email === order.email;

  if (!order || (!ownsByAuth && !ownsByEmail)) {
    return NextResponse.json({
      found: false,
      error: "No order found with that number and email.",
    });
  }

  return NextResponse.json({
    found: true,
    reference: order.reference,
    status: order.status,
    fulfillmentStatus: order.fulfillmentStatus ?? "unfulfilled",
    placedAt: order.createdAt,
    paidAt: order.paidAt ?? null,
    amount: order.amount,
    customerName: order.customer?.name ?? "",
    destination: [order.shipping?.city, order.shipping?.state]
      .filter(Boolean)
      .join(", "),
    items: order.items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      size: i.size ?? null,
      image: i.image ?? null,
    })),
  });
}
