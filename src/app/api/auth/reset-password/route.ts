import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
  token: z.string().min(10),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Please check the form." },
      { status: 400 },
    );
  }

  const { email, token, password } = parsed.data;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  await connectToDatabase();
  const user = await User.findOne({
    email: email.toLowerCase().trim(),
    resetTokenHash: tokenHash,
    resetTokenExpires: { $gt: new Date() },
  });

  if (!user) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Please request a new one." },
      { status: 400 },
    );
  }

  user.password = await bcrypt.hash(password, 10);
  user.set("resetTokenHash", undefined);
  user.set("resetTokenExpires", undefined);
  await user.save();

  return NextResponse.json({ ok: true });
}
