import "server-only";
import sanitizeHtml from "sanitize-html";
import { connectToDatabase } from "@/lib/db";
import { BlogPost, type IBlogPost } from "@/lib/models/BlogPost";

export interface BlogPostView {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  tags: string[];
  status: "published" | "draft";
  trashed: boolean;
  seoTitle?: string;
  seoDescription?: string;
  author?: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Allow only safe, editor-produced formatting. Runs on save. */
export function cleanContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "hr",
      "h2",
      "h3",
      "h4",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "blockquote",
      "ul",
      "ol",
      "li",
      "a",
      "img",
      "code",
      "pre",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
    },
  });
}

function toView(doc: IBlogPost): BlogPostView {
  return {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    excerpt: doc.excerpt ?? "",
    content: doc.content ?? "",
    coverImage: doc.coverImage,
    tags: doc.tags ?? [],
    status: doc.status === "published" ? "published" : "draft",
    trashed: !!doc.trashed,
    seoTitle: doc.seoTitle,
    seoDescription: doc.seoDescription,
    author: doc.author,
    publishedAt: doc.publishedAt ? new Date(doc.publishedAt).toISOString() : null,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  };
}

/** Public: published, non-trashed posts, newest published first. */
export async function getPublishedPosts(): Promise<BlogPostView[]> {
  await connectToDatabase();
  const docs = await BlogPost.find({ status: "published", trashed: { $ne: true } })
    .sort({ publishedAt: -1, createdAt: -1 })
    .lean<IBlogPost[]>();
  return docs.map(toView);
}

/** Public: a single published post by slug (returns null for drafts/trash). */
export async function getPublishedPostBySlug(
  slug: string,
): Promise<BlogPostView | null> {
  await connectToDatabase();
  const doc = await BlogPost.findOne({
    slug,
    status: "published",
    trashed: { $ne: true },
  }).lean<IBlogPost>();
  return doc ? toView(doc) : null;
}

/** Admin: all posts (optionally only trash). */
export async function getAdminPosts(opts?: {
  trashedOnly?: boolean;
}): Promise<BlogPostView[]> {
  await connectToDatabase();
  const filter = opts?.trashedOnly ? { trashed: true } : { trashed: { $ne: true } };
  const docs = await BlogPost.find(filter)
    .sort({ createdAt: -1 })
    .lean<IBlogPost[]>();
  return docs.map(toView);
}

export async function getPostById(id: string): Promise<BlogPostView | null> {
  await connectToDatabase();
  const doc = await BlogPost.findById(id).lean<IBlogPost>();
  return doc ? toView(doc) : null;
}
