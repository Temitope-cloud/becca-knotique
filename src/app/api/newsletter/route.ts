import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { NewsletterSubscriber } from "@/lib/models/NewsletterSubscriber";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const subscriberSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  consent: z.literal(true),
});

export async function POST(request: Request) {
  const limited = await rateLimit("newsletter", clientIp(request), { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!limited.ok) return NextResponse.json({ error: "Please wait a few minutes before trying again." }, { status: 429 });
  const parsed = subscriberSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email and confirm your consent." }, { status: 400 });
  await connectToDatabase();
  await NewsletterSubscriber.updateOne(
    { email: parsed.data.email.toLowerCase().trim() },
    { $set: { active: true, consentedAt: new Date() } },
    { upsert: true },
  );
  return NextResponse.json({ ok: true });
}
