import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { confirmTwoFactorCode, sendTwoFactorChallenge } from "@/lib/two-factor";

export const runtime = "nodejs";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("request_enable") }),
  z.object({ action: z.literal("confirm_enable"), code: z.string().regex(/^\d{6}$/) }),
  z.object({ action: z.literal("request_disable") }),
  z.object({ action: z.literal("confirm_disable"), code: z.string().regex(/^\d{6}$/) }),
]);

async function currentUser() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return null;
  await connectToDatabase();
  return User.findById(session.user.id).select("email twoFactorEnabled");
}

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ enabled: Boolean(user.twoFactorEnabled) });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Please check the security code." }, { status: 400 });

  if (parsed.data.action === "request_enable" || parsed.data.action === "request_disable") {
    if (parsed.data.action === "request_enable" && user.twoFactorEnabled) {
      return NextResponse.json({ error: "Two-step verification is already enabled." }, { status: 400 });
    }
    if (parsed.data.action === "request_disable" && !user.twoFactorEnabled) {
      return NextResponse.json({ error: "Two-step verification is not enabled." }, { status: 400 });
    }
    const sent = await sendTwoFactorChallenge(user._id.toString(), user.email);
    if (!sent) return NextResponse.json({ error: "Security email sending is not configured yet." }, { status: 503 });
    return NextResponse.json({ ok: true, challengeSent: true });
  }

  const valid = await confirmTwoFactorCode(user._id.toString(), parsed.data.code);
  if (!valid) return NextResponse.json({ error: "That code is invalid or has expired." }, { status: 400 });

  const enabled = parsed.data.action === "confirm_enable";
  await User.updateOne({ _id: user._id }, { $set: { twoFactorEnabled: enabled } });
  return NextResponse.json({ ok: true, enabled });
}
