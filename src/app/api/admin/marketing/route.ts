import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { NewsletterSubscriber } from "@/lib/models/NewsletterSubscriber";
import { MarketingCampaign } from "@/lib/models/MarketingCampaign";
import { sendMarketingEmail } from "@/lib/email";

export const runtime = "nodejs";

const audienceSchema = z.enum(["all_opted_in", "newsletter", "customers"]);
const campaignSchema = z.object({
  subject: z.string().trim().min(3).max(160),
  previewText: z.string().trim().max(240).optional(),
  content: z.string().trim().min(10).max(20000),
  audience: audienceSchema.default("all_opted_in"),
});

type Contact = { email: string; name?: string; createdAt: Date; marketingOptIn?: boolean };

function recipientGroups(customers: Contact[], subscribers: Contact[]) {
  const customerEmails = new Set(customers.map((contact) => contact.email.toLowerCase()));
  const newsletter = subscribers.filter((contact) => !customerEmails.has(contact.email.toLowerCase()));
  const optedInCustomers = customers.filter((contact) => contact.marketingOptIn);
  const all = Array.from(new Map([...optedInCustomers, ...subscribers].map((contact) => [contact.email.toLowerCase(), contact])).values());
  return { all, newsletter, customers: optedInCustomers };
}

async function contacts() {
  const [customers, subscribers] = await Promise.all([
    User.find({ role: { $ne: "admin" }, deletionScheduledAt: null }).select("name email marketingOptIn createdAt").sort({ createdAt: -1 }).lean<Contact[]>(),
    NewsletterSubscriber.find({ active: true }).select("email createdAt").sort({ createdAt: -1 }).lean<Contact[]>(),
  ]);
  return { customers, groups: recipientGroups(customers, subscribers) };
}

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const [campaigns, contactData] = await Promise.all([MarketingCampaign.find().sort({ createdAt: -1 }).limit(30).lean(), contacts()]);
  return NextResponse.json({
    campaigns,
    audiences: { allOptedIn: contactData.groups.all.length, newsletter: contactData.groups.newsletter.length, customers: contactData.customers.length, optedInCustomers: contactData.groups.customers.length },
    contacts: {
      newsletter: contactData.groups.newsletter.map((contact) => ({ email: contact.email, joinedAt: contact.createdAt })),
      customers: contactData.customers.map((contact) => ({ name: contact.name, email: contact.email, joinedAt: contact.createdAt, marketingOptIn: Boolean(contact.marketingOptIn) })),
    },
  });
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = campaignSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Please add an audience, subject, and message." }, { status: 400 });
  await connectToDatabase();
  const campaign = await MarketingCampaign.create({ ...parsed.data, status: "draft" });
  return NextResponse.json({ campaign }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = z.string().min(1).safeParse((await request.json().catch(() => ({}))).id);
  if (!id.success) return NextResponse.json({ error: "Invalid campaign." }, { status: 400 });
  await connectToDatabase();
  const campaign = await MarketingCampaign.findById(id.data);
  if (!campaign || campaign.status !== "draft") return NextResponse.json({ error: "This campaign cannot be sent." }, { status: 400 });
  const { groups } = await contacts();
  const audience = campaign.audience ?? "all_opted_in";
  const recipients = audience === "newsletter" ? groups.newsletter : audience === "customers" ? groups.customers : groups.all;
  if (!recipients.length) return NextResponse.json({ error: "There are no opted-in recipients in this audience." }, { status: 400 });
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: "Email sending is not configured yet." }, { status: 503 });
  const sent = await Promise.all(recipients.map((recipient) => sendMarketingEmail({ to: recipient.email, subject: campaign.subject, previewText: campaign.previewText, content: campaign.content })));
  const sentCount = sent.filter(Boolean).length;
  if (!sentCount) return NextResponse.json({ error: "The email provider did not accept the campaign." }, { status: 502 });
  campaign.status = "sent";
  campaign.recipientCount = sentCount;
  campaign.sentAt = new Date();
  await campaign.save();
  return NextResponse.json({ campaign, sent: sentCount, failed: recipients.length - sentCount });
}
