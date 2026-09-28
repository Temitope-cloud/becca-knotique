import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sendTwoFactorChallenge } from "@/lib/two-factor";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });

  const email = parsed.data.email.toLowerCase().trim();
  const limited = await rateLimit("two-factor-login", `${clientIp(request)}:${email}`, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!limited.ok) return NextResponse.json({ error: "Too many attempts. Please wait a moment and try again." }, { status: 429 });

  await connectToDatabase();
  const user = await User.findOne({ email }).select("+password");
  if (!user?.password || user.isActive === false || !(await bcrypt.compare(parsed.data.password, user.password))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
  if (!user.twoFactorEnabled) return NextResponse.json({ requiresTwoFactor: false });

  const sent = await sendTwoFactorChallenge(user._id.toString(), user.email);
  if (!sent) {
    return NextResponse.json({ error: "Security email sending is not configured yet." }, { status: 503 });
  }
  return NextResponse.json({ requiresTwoFactor: true });
}
