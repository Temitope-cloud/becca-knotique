import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order, type IOrder } from "@/lib/models/Order";

export const runtime = "nodejs";

/**
 * Order lookup for the tracking page. An order is only revealed when BOTH the
 * order number AND its matching email are supplied — so orders can't be
 * enumerated by number alone, and a wrong email never returns someone's order.
 * (Signed-in customers see all their orders on the account page instead.)
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const input =
    typeof body?.reference === "string" ? body.reference.trim() : "";
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!input) {
    return NextResponse.json(
      { found: false, error: "Enter your order number." },
      { status: 400 },
    );
  }
  if (!email) {
    return NextResponse.json(
      { found: false, error: "Enter the email used for the order." },
      { status: 400 },
    );
  }

  await connectToDatabase();
  // Accept either the short order number (BK-1042) or the internal reference.
  const order = await Order.findOne({
    $or: [
      { orderNumber: new RegExp(`^${input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
      { reference: input },
    ],
  }).lean<IOrder>();

  // The email must match the order's email — the shared secret that proves
  // ownership. A missing order and a wrong email look identical to the caller.
  if (!order || email !== (order.email || "").toLowerCase()) {
    return NextResponse.json({
      found: false,
      error: "No order found with that number and email.",
    });
  }

  return NextResponse.json({
    found: true,
    reference: order.orderNumber ?? order.reference,
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
