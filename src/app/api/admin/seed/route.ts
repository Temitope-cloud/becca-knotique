import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { products as staticProducts } from "@/data/Products";

export const runtime = "nodejs";

/**
 * One-time import of the static catalog into MongoDB.
 * Allowed without auth ONLY while the collection is empty (so it can be run
 * once during setup); afterwards it requires an admin session.
 */
export async function POST() {
  await connectToDatabase();
  const existing = await Product.estimatedDocumentCount();

  if (existing > 0) {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Catalog already seeded. Admin required to re-seed." },
        { status: 403 },
      );
    }
  }

  let created = 0;
  let updated = 0;

  for (const p of staticProducts) {
    if (!p.slug || !p.name) continue;
    const doc = {
      name: p.name,
      slug: p.slug,
      subtitle: p.subtitle,
      category: p.category ?? "",
      madefor: p.madefor,
      price: p.price,
      oldPrice: p.oldPrice,
      currency: "NGN" as const,
      description: p.description ?? "",
      longDescription: p.longDescription,
      image: p.image,
      images: p.images ?? [],
      hoverImage: p.hoverImage,
      sizes: p.sizes ?? [],
      colors: p.colors ?? [],
      stars: p.stars,
      rating: p.rating,
      inStock: p.inStock !== false,
      stockCount: p.stockCount ?? 10,
      tags: p.tags ?? [],
      infos: (p.infos ?? []).map((i) => ({ label: i.label })),
      featured: p.category === "one-piece",
    };
    const res = await Product.updateOne(
      { slug: p.slug },
      { $set: doc, $setOnInsert: { active: true } },
      { upsert: true },
    );
    if (res.upsertedCount) created += 1;
    else updated += 1;
  }

  const total = await Product.estimatedDocumentCount();
  return NextResponse.json({ ok: true, created, updated, total });
}
