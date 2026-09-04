import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { recordRefund } from "@/lib/refunds";

export const runtime = "nodejs";

const schema = z.object({
  amount: z.number().positive(),
  reason: z.string().min(2).max(200),
  method: z.enum(["store_credit", "paystack", "manual"]),
  note: z.string().max(500).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the refund details." },
      { status: 400 },
    );
  }

  const result = await recordRefund({
    orderRef: id,
    amount: parsed.data.amount,
    reason: parsed.data.reason,
    method: parsed.data.method,
    note: parsed.data.note,
    adminEmail: session.user?.email ?? "admin",
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
