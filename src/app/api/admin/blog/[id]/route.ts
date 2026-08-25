import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { BlogPost } from "@/lib/models/BlogPost";
import { blogPostSchema } from "@/lib/validation/blog";
import { cleanContent } from "@/lib/blog";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  // Lightweight trash / restore actions.
  if (body?.action === "trash" || body?.action === "restore") {
    await connectToDatabase();
    const set =
      body.action === "trash"
        ? { trashed: true, trashedAt: new Date() }
        : { trashed: false, trashedAt: null };
    const res = await BlogPost.updateOne({ _id: id }, { $set: set });
    if (res.matchedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  }

  const parsed = blogPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check the post.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const existing = await BlogPost.findById(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const d = parsed.data;
  const update: Record<string, unknown> = {
    title: d.title.trim(),
    excerpt: d.excerpt?.trim() ?? "",
    content: cleanContent(d.content ?? ""),
    coverImage: d.coverImage || undefined,
    tags: d.tags,
    status: d.status,
    seoTitle: d.seoTitle?.trim() || undefined,
    seoDescription: d.seoDescription?.trim() || undefined,
  };

  // Stamp publishedAt the first time it goes live.
  if (d.status === "published" && !existing.publishedAt) {
    update.publishedAt = new Date();
  }

  if (d.slug) {
    const slug = slugify(d.slug);
    const clash = await BlogPost.exists({ slug, _id: { $ne: id } });
    if (clash) {
      return NextResponse.json(
        { error: "That slug is already in use." },
        { status: 409 },
      );
    }
    update.slug = slug;
  }

  await BlogPost.updateOne({ _id: id }, { $set: update });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await connectToDatabase();
  await BlogPost.deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
}
