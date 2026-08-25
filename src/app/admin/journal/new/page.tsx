import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import BlogForm from "@/components/admin/BlogForm";

export default async function NewPostPage() {
  await requireAdmin();
  return (
    <div className="px-5 py-8 sm:px-8">
      <Link
        href="/admin/journal"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to journal
      </Link>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-stone-900">
        New post
      </h1>
      <BlogForm />
    </div>
  );
}
