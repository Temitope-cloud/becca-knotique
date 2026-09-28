import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/lib/models/Product";

export const runtime = "nodejs";

/** Current lead times for cart items. This keeps an older saved cart in sync with the catalogue. */
export async function GET(request: Request) {
  const ids = [...new Set(new URL(request.url).searchParams.getAll("id").map((id) => id.trim()).filter(Boolean))].slice(0, 20);
  if (!ids.length) return NextResponse.json({ items: [] });

  await connectToDatabase();
  const products = await Product.find({ _id: { $in: ids } })
    .select("_id madeToOrder leadTime")
    .lean<Array<{ _id: { toString(): string }; madeToOrder?: boolean; leadTime?: string }>>();

  return NextResponse.json({
    items: products.map((product) => ({
      id: product._id.toString(),
      madeToOrder: Boolean(product.madeToOrder),
      leadTime: product.leadTime,
    })),
  });
}
