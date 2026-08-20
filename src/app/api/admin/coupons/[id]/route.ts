import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { Coupon } from "@/lib/models/Coupon";

export const runtime = "nodejs";

const schema = z.object({
  active: z.boolean().optional(),
  value: z.number().min(0).optional(),
  minOrder: z.number().min(0).optional(),
  usageLimit: z.number().min(0).optional(),
  expiresAt: z.string().nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  }

  const update: Record<string, unknown> = { ...parsed.data };
  if ("expiresAt" in parsed.data) {
    update.expiresAt = parsed.data.expiresAt
      ? new Date(parsed.data.expiresAt)
      : null;
  }

  await connectToDatabase();
  const result = await Coupon.updateOne({ _id: id }, { $set: update });
  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
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
  await Coupon.deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
}
