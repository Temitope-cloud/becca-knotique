import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { Settings } from "@/lib/models/Settings";
import { cleanContent } from "@/lib/blog";

export const runtime = "nodejs";

const urlOrEmpty = z.string().url().or(z.literal("")).optional();

const schema = z.object({
  storeName: z.string().max(120).optional(),
  supportEmail: z.string().email().or(z.literal("")).optional(),
  supportPhone: z.string().max(30).optional(),
  announcement: z.string().max(200).optional(),
  shippingFee: z.number().min(0).optional(),
  freeShippingThreshold: z.number().min(0).optional(),
  // Contact & social
  address: z.string().max(200).optional(),
  instagram: urlOrEmpty,
  tiktok: urlOrEmpty,
  whatsapp: urlOrEmpty,
  foundedYear: z.string().max(10).optional(),
  // SEO
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(200).optional(),
  // Policy page overrides (HTML)
  policies: z
    .object({
      privacy: z.string().max(40000).optional(),
      terms: z.string().max(40000).optional(),
      refund: z.string().max(40000).optional(),
      disclaimer: z.string().max(40000).optional(),
    })
    .optional(),
});

export async function PATCH(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid settings" }, { status: 400 });
  }

  const data = { ...parsed.data };
  // Sanitize any policy HTML before storing.
  if (data.policies) {
    data.policies = {
      privacy: data.policies.privacy ? cleanContent(data.policies.privacy) : "",
      terms: data.policies.terms ? cleanContent(data.policies.terms) : "",
      refund: data.policies.refund ? cleanContent(data.policies.refund) : "",
      disclaimer: data.policies.disclaimer
        ? cleanContent(data.policies.disclaimer)
        : "",
    };
  }

  await connectToDatabase();
  await Settings.updateOne({ key: "store" }, { $set: data }, { upsert: true });
  return NextResponse.json({ ok: true });
}
