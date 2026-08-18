import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";

export const runtime = "nodejs";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(80),
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

function isAdminEmail(email: string): boolean {
  const admin = process.env.ADMIN_EMAIL?.toLowerCase();
  return !!admin && email.toLowerCase() === admin;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check your details.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    await connectToDatabase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
      provider: "credentials",
      role: isAdminEmail(normalizedEmail) ? "admin" : "customer",
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[register] error:", error);
    return NextResponse.json(
      { error: "Something went wrong creating your account." },
      { status: 500 },
    );
  }
}
