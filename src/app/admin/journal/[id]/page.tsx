import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { getPostById } from "@/lib/blog";
import BlogForm from "@/components/admin/BlogForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <div className="px-5 py-8 sm:px-8">
      <Link
        href="/admin/journal"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to journal
      </Link>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-stone-900">
        Edit post
      </h1>
      <BlogForm
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage,
          tags: post.tags,
          seoTitle: post.seoTitle,
          seoDescription: post.seoDescription,
          status: post.status,
        }}
      />
    </div>
  );
}
