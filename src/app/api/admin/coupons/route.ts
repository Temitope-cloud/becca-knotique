import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { Coupon } from "@/lib/models/Coupon";

export const runtime = "nodejs";

const schema = z.object({
  code: z.string().min(3).max(30),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().min(0),
  minOrder: z.number().min(0).default(0),
  usageLimit: z.number().min(0).default(0),
  expiresAt: z.string().optional(),
  active: z.boolean().default(true),
});

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid coupon details." }, { status: 400 });
  }

  const { code, type, value, minOrder, usageLimit, expiresAt, active } =
    parsed.data;

  await connectToDatabase();
  const normalized = code.toUpperCase().trim();
  if (await Coupon.exists({ code: normalized })) {
    return NextResponse.json(
      { error: "A coupon with that code already exists." },
      { status: 409 },
    );
  }

  await Coupon.create({
    code: normalized,
    type,
    value,
    minOrder,
    usageLimit,
    active,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
