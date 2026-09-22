import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { MarketingCampaign } from "@/lib/models/MarketingCampaign";
import { sendMarketingEmail } from "@/lib/email";

export const runtime = "nodejs";

const campaignSchema = z.object({
  subject: z.string().trim().min(3).max(160),
  previewText: z.string().trim().max(240).optional(),
  content: z.string().trim().min(10).max(20000),
});

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const [campaigns, recipients] = await Promise.all([
    MarketingCampaign.find().sort({ createdAt: -1 }).limit(30).lean(),
    User.countDocuments({ role: { $ne: "admin" }, marketingOptIn: true, deletionScheduledAt: null }),
  ]);
  return NextResponse.json({ campaigns, recipients });
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = campaignSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Please add a subject and message." }, { status: 400 });
  await connectToDatabase();
  const campaign = await MarketingCampaign.create({ ...parsed.data, status: "draft" });
  return NextResponse.json({ campaign }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const id = z.string().min(1).safeParse(body.id);
  if (!id.success) return NextResponse.json({ error: "Invalid campaign." }, { status: 400 });
  await connectToDatabase();
  const campaign = await MarketingCampaign.findById(id.data);
  if (!campaign || campaign.status !== "draft") return NextResponse.json({ error: "This campaign cannot be sent." }, { status: 400 });
  const recipients = await User.find({ role: { $ne: "admin" }, marketingOptIn: true, deletionScheduledAt: null }).select("email").lean();
  if (!recipients.length) return NextResponse.json({ error: "No customers have opted in yet." }, { status: 400 });
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: "Email sending is not configured yet." }, { status: 503 });
  const sent = await Promise.all(recipients.map((user) => sendMarketingEmail({ to: user.email, subject: campaign.subject, previewText: campaign.previewText, content: campaign.content })));
  const sentCount = sent.filter(Boolean).length;
  if (!sentCount) return NextResponse.json({ error: "The email provider did not accept the campaign." }, { status: 502 });
  campaign.status = "sent";
  campaign.recipientCount = sentCount;
  campaign.sentAt = new Date();
  await campaign.save();
  return NextResponse.json({ campaign, sent: sentCount, failed: recipients.length - sentCount });
}
