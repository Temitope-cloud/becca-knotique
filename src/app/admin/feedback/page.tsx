import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { AccountDeletionFeedback } from "@/lib/models/AccountDeletionFeedback";

export const metadata: Metadata = {
  title: "Why customers leave",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Range = "30d" | "90d" | "all";

function reasonLabel(reason: string): string {
  return reason === "unspecified" ? "Prefer not to say" : reason;
}

export default async function DeletionFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  await requireAdmin();
  const { range: rawRange } = await searchParams;
  const range: Range = (["30d", "90d", "all"].includes(rawRange ?? "")
    ? rawRange
    : "all") as Range;
  const days = range === "30d" ? 30 : range === "90d" ? 90 : 0;

  await connectToDatabase();
  const match =
    days > 0
      ? { createdAt: { $gte: new Date(Date.now() - days * 86_400_000) } }
      : {};

  const [total, byReason, comments] = await Promise.all([
    AccountDeletionFeedback.countDocuments(match),
    AccountDeletionFeedback.aggregate<{ _id: string; count: number }>([
      { $match: match },
      { $group: { _id: "$reason", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    AccountDeletionFeedback.find({
      ...match,
      comment: { $exists: true, $ne: "" },
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
  ]);

  const maxCount = byReason.reduce((m, r) => Math.max(m, r.count), 0) || 1;

  const tabs: { key: Range; label: string }[] = [
    { key: "30d", label: "Last 30 days" },
    { key: "90d", label: "Last 90 days" },
    { key: "all", label: "All time" },
  ];

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="mb-6 max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Why customers leave
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Reasons people gave when deleting their account. Collected
          anonymously, no names or emails are stored, so this is honest
          feedback you can learn from.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = range === t.key;
          return (
            <Link
              key={t.key}
              href={t.key === "all" ? "/admin/feedback" : `/admin/feedback?range=${t.key}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-stone-900 text-white"
                  : "border border-stone-300 bg-white text-stone-600 hover:border-stone-400"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <MessageSquare className="h-10 w-10 text-stone-300" />
          <p className="mt-4 text-stone-600">
            No account deletions in this period. That&apos;s a good thing.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Breakdown */}
          <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
            <div className="flex items-baseline justify-between">
              <h2 className="font-semibold text-stone-900">Reasons</h2>
              <span className="text-sm text-stone-500">
                {total} {total === 1 ? "deletion" : "deletions"}
              </span>
            </div>
            <ul className="mt-4 space-y-3">
              {byReason.map((r) => {
                const pct = Math.round((r.count / total) * 100);
                return (
                  <li key={r._id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone-700">{reasonLabel(r._id)}</span>
                      <span className="font-medium text-stone-900">
                        {r.count}{" "}
                        <span className="text-stone-400">({pct}%)</span>
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-stone-100">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${Math.round((r.count / maxCount) * 100)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Comments */}
          <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
            <h2 className="font-semibold text-stone-900">What they said</h2>
            {comments.length === 0 ? (
              <p className="mt-4 text-sm text-stone-500">
                No written comments in this period.
              </p>
            ) : (
              <ul className="mt-4 space-y-4">
                {comments.map((c) => (
                  <li
                    key={String(c._id)}
                    className="border-b border-stone-100 pb-4 last:border-0 last:pb-0"
                  >
                    <p className="text-sm text-stone-700">
                      &ldquo;{c.comment}&rdquo;
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-stone-400">
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-stone-500">
                        {reasonLabel(c.reason)}
                      </span>
                      <span>
                        {new Date(c.createdAt).toLocaleDateString("en-NG", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
