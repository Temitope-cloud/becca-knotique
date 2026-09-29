import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { sendPasswordChangedEmail } from "@/lib/email";

export const runtime = "nodejs";

const schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
  currentPassword: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Please check the form." }, { status: 400 });

  await connectToDatabase();
  const user = await User.findById(session.user.id).select("+password name email isActive");
  if (!user || user.isActive === false) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const passwordHash = user.password;
  const hadPassword = Boolean(passwordHash);
  if (passwordHash) {
    if (!parsed.data.currentPassword || !(await bcrypt.compare(parsed.data.currentPassword, passwordHash))) {
      return NextResponse.json({ error: "Enter your current password to change it." }, { status: 400 });
    }
  }

  user.password = await bcrypt.hash(parsed.data.password, 10);
  await user.save();
  await sendPasswordChangedEmail(user.email, user.name);
  return NextResponse.json({ ok: true, created: !hadPassword });
}
