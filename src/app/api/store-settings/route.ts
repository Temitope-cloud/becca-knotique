import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";

export const runtime = "nodejs";

/** Public, read-only store settings the storefront needs (shipping, banner). */
export async function GET() {
  const s = await getSettings();
  return NextResponse.json({
    shippingFee: s.shippingFee,
    freeShippingThreshold: s.freeShippingThreshold,
    announcement: s.announcement,
    supportPhone: s.supportPhone,
    storeName: s.storeName,
  });
}
