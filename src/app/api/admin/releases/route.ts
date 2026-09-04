import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { Release } from "@/lib/models/Release";
import { releaseSchema } from "@/lib/validation/release";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = releaseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the entry details.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const created = await Release.create(parsed.data);
  return NextResponse.json(
    { ok: true, id: created._id.toString() },
    { status: 201 },
  );
}
