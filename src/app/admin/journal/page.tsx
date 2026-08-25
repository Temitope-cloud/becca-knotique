import Link from "next/link";
import Image from "next/image";
import { Plus, Newspaper, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminPosts, type BlogPostView } from "@/lib/blog";
import TrashRowActions from "@/components/admin/TrashRowActions";

type Filter = "all" | "published" | "draft" | "trash";

export default async function AdminJournalPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  await requireAdmin();
  const { filter: rawFilter } = await searchParams;
  const filter: Filter = (
    ["all", "published", "draft", "trash"].includes(rawFilter ?? "")
      ? rawFilter
      : "all"
  ) as Filter;

  const [live, trashed] = await Promise.all([
    getAdminPosts(),
    getAdminPosts({ trashedOnly: true }),
  ]);

  const counts = {
    all: live.length,
    published: live.filter((p) => p.status === "published").length,
    draft: live.filter((p) => p.status === "draft").length,
    trash: trashed.length,
  };

  const isTrash = filter === "trash";
  const posts: BlogPostView[] = isTrash
    ? trashed
    : filter === "published"
      ? live.filter((p) => p.status === "published")
      : filter === "draft"
        ? live.filter((p) => p.status === "draft")
        : live;

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "published", label: "Published" },
    { key: "draft", label: "Draft" },
    { key: "trash", label: "Trash" },
  ];

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
            Journal
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Write posts and care guides that bring shoppers to the store.
          </p>
        </div>
        <Link
          href="/admin/journal/new"
          className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          <Plus className="h-4 w-4" /> New post
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = filter === t.key;
          return (
            <Link
              key={t.key}
              href={t.key === "all" ? "/admin/journal" : `/admin/journal?filter=${t.key}`}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-stone-900 text-white"
                  : "border border-stone-300 bg-white text-stone-600 hover:border-stone-400"
              }`}
            >
              {t.key === "trash" ? <Trash2 className="h-3.5 w-3.5" /> : null}
              {t.label}
              <span
                className={`rounded-full px-1.5 text-xs ${
                  active ? "bg-white/20" : "bg-stone-100 text-stone-500"
                }`}
              >
                {counts[t.key]}
              </span>
            </Link>
          );
        })}
      </div>

      {posts.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <Newspaper className="h-10 w-10 text-stone-300" />
          <p className="mt-4 text-stone-600">
            {isTrash ? "Trash is empty." : "No posts here yet."}
          </p>
          {!isTrash ? (
            <Link
              href="/admin/journal/new"
              className="mt-6 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Write your first post
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs tracking-wide text-stone-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Post</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 text-right font-medium">
                  {isTrash ? "Actions" : ""}
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-md bg-stone-100">
                        {p.coverImage ? (
                          <Image
                            src={p.coverImage}
                            alt=""
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <span className="font-medium text-stone-900">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        p.status === "published"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {p.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-stone-500">
                    {new Date(p.publishedAt ?? p.createdAt).toLocaleDateString(
                      "en-NG",
                      { year: "numeric", month: "short", day: "numeric" },
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isTrash ? (
                      <TrashRowActions
                        id={p.id}
                        endpoint="/api/admin/blog"
                        label="post"
                      />
                    ) : (
                      <Link
                        href={`/admin/journal/${p.id}`}
                        className="text-sm font-medium text-stone-600 hover:text-stone-900 hover:underline"
                      >
                        Edit
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
