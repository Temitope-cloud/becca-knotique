import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Coupon, computeCouponDiscount } from "@/lib/models/Coupon";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const code = typeof body?.code === "string" ? body.code.toUpperCase().trim() : "";
  const subtotal = Number(body?.subtotal) || 0;

  if (!code) {
    return NextResponse.json({ valid: false, reason: "Enter a code." });
  }

  await connectToDatabase();
  const coupon = await Coupon.findOne({ code }).lean();
  if (!coupon) {
    return NextResponse.json({ valid: false, reason: "Invalid code." });
  }

  const result = computeCouponDiscount(coupon, subtotal);
  return NextResponse.json({
    valid: result.valid,
    discount: result.discount,
    reason: result.reason,
    code,
  });
}
