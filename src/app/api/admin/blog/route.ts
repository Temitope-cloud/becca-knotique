import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { BlogPost } from "@/lib/models/BlogPost";
import { blogPostSchema } from "@/lib/validation/blog";
import { cleanContent } from "@/lib/blog";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";

async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || "post";
  let slug = root;
  let n = 2;
  // eslint-disable-next-line no-await-in-loop
  while (await BlogPost.exists({ slug })) {
    slug = `${root}-${n}`;
    n += 1;
  }
  return slug;
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
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

  const d = parsed.data;
  await connectToDatabase();
  const slug = await uniqueSlug(d.slug || d.title);

  const created = await BlogPost.create({
    title: d.title.trim(),
    slug,
    excerpt: d.excerpt?.trim() ?? "",
    content: cleanContent(d.content ?? ""),
    coverImage: d.coverImage || undefined,
    tags: d.tags,
    status: d.status,
    seoTitle: d.seoTitle?.trim() || undefined,
    seoDescription: d.seoDescription?.trim() || undefined,
    author: session.user?.name ?? "Becca's Knotique",
    publishedAt: d.status === "published" ? new Date() : null,
  });

  return NextResponse.json(
    { ok: true, id: created._id.toString() },
    { status: 201 },
  );
}
