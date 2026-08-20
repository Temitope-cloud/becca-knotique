import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { productSchema } from "@/lib/validation/product";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";

async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || "product";
  let slug = root;
  let n = 2;
  // eslint-disable-next-line no-await-in-loop
  while (await Product.exists({ slug })) {
    slug = `${root}-${n}`;
    n += 1;
  }
  return slug;
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
  const slug = await uniqueSlug(data.slug || data.name);

  const created = await Product.create({
    ...data,
    slug,
    image: data.images[0],
    hoverImage: data.images[1],
    currency: "NGN",
  });

  return NextResponse.json({ ok: true, id: created._id.toString() }, { status: 201 });
}
