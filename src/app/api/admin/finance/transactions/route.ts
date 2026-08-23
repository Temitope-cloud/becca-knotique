import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { FinanceTransaction } from "@/lib/models/FinanceTransaction";
import { signedAmount } from "@/lib/finance";

export const runtime = "nodejs";

const schema = z.object({
  date: z.string().optional(),
  description: z.string().min(1, "Description is required.").max(200),
  type: z.enum([
    "revenue",
    "paystack_fee",
    "cogs",
    "expense",
    "salary",
    "drawing",
    "tax_provision",
    "tax_payment",
    "refund",
    "other_income",
    "other_expense",
  ]),
  amount: z.number().positive("Amount must be greater than zero."),
  category: z.string().max(60).optional(),
  reference: z.string().max(120).optional(),
  notes: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check the entry.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const d = parsed.data;
  await connectToDatabase();
  await FinanceTransaction.create({
    date: d.date ? new Date(d.date) : new Date(),
    description: d.description.trim(),
    type: d.type,
    amount: signedAmount(d.type, d.amount),
    category: d.category?.trim() || undefined,
    reference: d.reference?.trim() || undefined,
    notes: d.notes?.trim() || undefined,
    source: "manual",
    createdBy: session.user?.email ?? "admin",
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
