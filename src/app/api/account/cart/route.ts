import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";

export const runtime = "nodejs";

const cartItemSchema = z.object({
  productId: z.string().min(1).max(100),
  slug: z.string().min(1).max(200),
  name: z.string().min(1).max(300),
  image: z.string().max(2000).optional(),
  price: z.number().finite().nonnegative(),
  quantity: z.number().int().min(1).max(50),
  size: z.string().max(100).optional(),
  color: z.string().max(100).optional(),
  measurements: z.array(z.object({ label: z.string().max(100), value: z.string().max(100) })).max(30).optional(),
  customColor: z.string().max(300).optional(),
  referenceImage: z.string().max(2000).optional(),
  madeToOrder: z.boolean().optional(),
  leadTime: z.string().max(200).optional(),
});
const schema = z.object({ items: z.array(cartItemSchema).max(50) });

async function currentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  await connectToDatabase();
  return User.findById(session.user.id).select("cart isActive");
}

export async function GET() {
  const user = await currentUser();
  if (!user || user.isActive === false) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ items: user.cart ?? [] });
}

export async function PUT(request: Request) {
  const user = await currentUser();
  if (!user || user.isActive === false) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Could not save this cart." }, { status: 400 });
  await User.updateOne({ _id: user._id }, { $set: { cart: parsed.data.items } });
  return NextResponse.json({ ok: true });
}
