import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { Settings } from "@/lib/models/Settings";

export const runtime = "nodejs";

const schema = z.object({
  storeName: z.string().max(120).optional(),
  supportEmail: z.string().email().or(z.literal("")).optional(),
  supportPhone: z.string().max(30).optional(),
  announcement: z.string().max(200).optional(),
  shippingFee: z.number().min(0).optional(),
  freeShippingThreshold: z.number().min(0).optional(),
});

export async function PATCH(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid settings" }, { status: 400 });
  }

  await connectToDatabase();
  await Settings.updateOne(
    { key: "store" },
    { $set: parsed.data },
    { upsert: true },
  );
  return NextResponse.json({ ok: true });
}
