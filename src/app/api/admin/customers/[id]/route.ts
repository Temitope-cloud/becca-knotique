import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { addStoreCredit } from "@/lib/store-credit";

export const runtime = "nodejs";

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("add_credit"),
    amount: z.number().int().positive().max(1_000_000),
    note: z.string().min(2).max(240),
  }),
  z.object({
    action: z.literal("set_active"),
    isActive: z.boolean(),
  }),
]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the details and try again." }, { status: 400 });
  }

  await connectToDatabase();
  const customer = await User.findOne({ _id: id, role: { $ne: "admin" } }).select("_id isActive").lean();
  if (!customer) {
    return NextResponse.json({ error: "Customer not found." }, { status: 404 });
  }

  if (parsed.data.action === "add_credit") {
    const balance = await addStoreCredit(id, parsed.data.amount, {
      reason: "adjustment",
      description: parsed.data.note,
      createdBy: session.user.email ?? "admin",
    });
    return NextResponse.json({ ok: true, balance });
  }

  await User.updateOne({ _id: id }, { $set: { isActive: parsed.data.isActive } });
  return NextResponse.json({ ok: true, isActive: parsed.data.isActive });
}
