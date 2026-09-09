import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { sendPasswordResetEmail } from "@/lib/email";

export const runtime = "nodejs";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);

  // Always respond the same way so the endpoint can't be used to discover which
  // emails have accounts (account enumeration).
  const generic = NextResponse.json({ ok: true });
  if (!parsed.success) return generic;

  const email = parsed.data.email.toLowerCase().trim();
  await connectToDatabase();
  const user = await User.findOne({ email }).select("+password");

  // Only credentials accounts (with a password) can reset here. Google-only
  // accounts sign in with Google, so there's nothing to reset.
  if (!user || !user.password) return generic;

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  user.resetTokenHash = tokenHash;
  user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  const base =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    new URL(request.url).origin;
  const link = `${base}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

  const sent = await sendPasswordResetEmail(email, user.name, link);
  if (!sent) {
    // Email isn't configured yet (no RESEND_API_KEY) — surface the link in logs
    // so resets still work in development.
    console.log("[password-reset] email not sent (Resend not configured). Link:", link);
  }

  return generic;
}
