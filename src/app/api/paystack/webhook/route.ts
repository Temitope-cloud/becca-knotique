import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/lib/models/Order";

export const runtime = "nodejs";

/**
 * Paystack webhook. Configure the URL in your Paystack dashboard:
 *   <YOUR_DOMAIN>/api/paystack/webhook
 * We verify the x-paystack-signature header (HMAC-SHA512 of the raw body).
 */
export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  const expected = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  if (!signature || signature !== expected) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    if (event.event === "charge.success" && event.data?.reference) {
      await connectToDatabase();
      await Order.findOneAndUpdate(
        { reference: event.data.reference, status: { $ne: "paid" } },
        { status: "paid", paidAt: new Date(), paystack: event.data },
      );
    }
  } catch (error) {
    console.error("[paystack webhook] error:", error);
    // Return 200 so Paystack doesn't hammer retries on our internal errors.
  }

  return NextResponse.json({ received: true });
}
