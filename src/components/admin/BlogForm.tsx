"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, FileText, Trash2 } from "lucide-react";
import ImageUploader from "./ImageUploader";
import RichTextEditor from "./RichTextEditor";

export interface BlogInput {
  id?: string;
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  status?: "published" | "draft";
}

type SaveStatus = "published" | "draft";

export default function BlogForm({ post }: { post?: BlogInput }) {
  const router = useRouter();
  const editing = Boolean(post?.id);
  const isDraft = post?.status !== "published";

  const [form, setForm] = useState({
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    tags: (post?.tags ?? []).join(", "),
    seoTitle: post?.seoTitle ?? "",
    seoDescription: post?.seoDescription ?? "",
  });
  const [content, setContent] = useState(post?.content ?? "");
  const [cover, setCover] = useState<string[]>(
    post?.coverImage ? [post.coverImage] : [],
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingAs, setSavingAs] = useState<SaveStatus | null>(null);
  const [deleting, setDeleting] = useState(false);

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(status: SaveStatus) {
    setError(null);
    setSaving(true);
    setSavingAs(status);
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      excerpt: form.excerpt.trim(),
      content,
      coverImage: cover[0] || "",
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      seoTitle: form.seoTitle.trim() || undefined,
      seoDescription: form.seoDescription.trim() || undefined,
      status,
    };
    try {
      const res = await fetch(
        editing ? `/api/admin/blog/${post!.id}` : "/api/admin/blog",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Could not save the post.");
        setSaving(false);
        setSavingAs(null);
        return;
      }
      router.push("/admin/journal");
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setSaving(false);
      setSavingAs(null);
    }
  }

  async function handleTrash() {
    if (!editing) return;
    if (!confirm("Move this post to trash? You can restore it later.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/blog/${post!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trash" }),
      });
      if (res.ok) {
        router.push("/admin/journal");
        router.refresh();
      } else setDeleting(false);
    } catch {
      setDeleting(false);
    }
  }

  const input =
    "w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10";
  const label = "mb-1.5 block text-sm font-medium text-stone-700";

  return (
    <div className="max-w-3xl space-y-6">
      <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <div className="space-y-4">
          <div>
            <label className={label}>Title</label>
            <input
              required
              value={form.title}
              onChange={set("title")}
              placeholder="e.g. How to care for your crochet pieces"
              className={input}
            />
          </div>
          <div>
            <label className={label}>Slug (optional)</label>
            <input
              value={form.slug}
              onChange={set("slug")}
              placeholder="auto-generated from the title"
              className={input}
            />
          </div>
          <div>
            <label className={label}>Excerpt (short summary)</label>
            <textarea
              rows={2}
              value={form.excerpt}
              onChange={set("excerpt")}
              placeholder="One or two sentences shown on the journal list and in search results."
              className={input}
            />
          </div>
          <div>
            <label className={label}>Cover image</label>
            <ImageUploader value={cover} onChange={setCover} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <label className={label}>Post content</label>
        <RichTextEditor value={content} onChange={setContent} />
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <h2 className="font-semibold text-stone-900">Extras</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className={label}>Tags (comma separated)</label>
            <input
              value={form.tags}
              onChange={set("tags")}
              placeholder="care, styling, behind the scenes"
              className={input}
            />
          </div>
          <div>
            <label className={label}>SEO title (optional)</label>
            <input value={form.seoTitle} onChange={set("seoTitle")} className={input} />
          </div>
          <div>
            <label className={label}>SEO description (optional)</label>
            <textarea
              rows={2}
              value={form.seoDescription}
              onChange={set("seoDescription")}
              className={input}
            />
          </div>
        </div>
      </div>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => submit("published")}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
        >
          {saving && savingAs === "published" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          {editing ? (isDraft ? "Publish" : "Save changes") : "Publish"}
        </button>
        <button
          type="button"
          onClick={() => submit("draft")}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 disabled:opacity-60"
        >
          {saving && savingAs === "draft" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          Save as draft
        </button>
        {editing ? (
          <button
            type="button"
            onClick={handleTrash}
            disabled={deleting}
            className="ml-auto inline-flex items-center gap-2 rounded-xl border border-rose-200 px-5 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Move to trash
          </button>
        ) : null}
      </div>
    </div>
  );
}
