import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { RefundRequest } from "@/lib/models/RefundRequest";
import { recordRefund } from "@/lib/refunds";

export const runtime = "nodejs";

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("approve"),
    amount: z.number().positive(),
    method: z.enum(["store_credit", "paystack", "manual"]),
    note: z.string().max(500).optional(),
  }),
  z.object({
    action: z.literal("decline"),
    note: z.string().max(500).optional(),
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
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  await connectToDatabase();
  const req = await RefundRequest.findById(id);
  if (!req) {
    return NextResponse.json({ error: "Request not found." }, { status: 404 });
  }
  if (req.status !== "pending") {
    return NextResponse.json(
      { error: "This request has already been handled." },
      { status: 409 },
    );
  }

  const adminEmail = session.user?.email ?? "admin";

  if (parsed.data.action === "decline") {
    req.status = "declined";
    req.adminNote = parsed.data.note;
    req.resolvedBy = adminEmail;
    req.resolvedAt = new Date();
    await req.save();
    return NextResponse.json({ ok: true });
  }

  // Approve → issue the actual refund, then mark resolved only if it succeeded.
  const result = await recordRefund({
    orderRef: req.orderNumber || req.orderReference,
    amount: parsed.data.amount,
    reason: req.reason,
    method: parsed.data.method,
    note: parsed.data.note
      ? `${parsed.data.note} (from customer request)`
      : "Approved from customer request",
    adminEmail,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  req.status = "approved";
  req.adminNote = parsed.data.note;
  req.resolvedBy = adminEmail;
  req.resolvedAt = new Date();
  await req.save();

  return NextResponse.json(result);
}
