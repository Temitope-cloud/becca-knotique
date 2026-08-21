import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/lib/models/Product";

export const runtime = "nodejs";

/** Increments a product's global view counter. Fire-and-forget from the client. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
  if (!slug) return NextResponse.json({ ok: false }, { status: 400 });

  try {
    await connectToDatabase();
    await Product.updateOne({ slug }, { $inc: { viewCount: 1 } });
  } catch {
    // non-critical — never block the page on analytics
  }
  return NextResponse.json({ ok: true });
}
