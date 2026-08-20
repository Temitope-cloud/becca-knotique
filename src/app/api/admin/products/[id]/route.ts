import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { productSchema } from "@/lib/validation/product";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the product details.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const data = parsed.data;

  const update: Record<string, unknown> = {
    ...data,
    image: data.images[0] ?? null,
    hoverImage: data.images[1] ?? null,
  };

  // Only change slug if one was explicitly provided and it's free.
  if (data.slug) {
    const slug = slugify(data.slug);
    const clash = await Product.exists({ slug, _id: { $ne: id } });
    if (clash) {
      return NextResponse.json(
        { error: "That slug is already in use." },
        { status: 409 },
      );
    }
    update.slug = slug;
  } else {
    delete update.slug;
  }

  const result = await Product.updateOne({ _id: id }, { $set: update });
  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await connectToDatabase();
  await Product.deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
}
