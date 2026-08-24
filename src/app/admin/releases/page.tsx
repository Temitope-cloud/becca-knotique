import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { releases, type ReleaseTag } from "@/data/releases";

export const metadata: Metadata = {
  title: "Release log",
  robots: { index: false, follow: false },
};

const tagStyles: Record<ReleaseTag, string> = {
  launch: "bg-emerald-100 text-emerald-800",
  feature: "bg-stone-900 text-white",
  improvement: "bg-stone-100 text-stone-700",
  fix: "bg-amber-100 text-amber-800",
};

const tagLabels: Record<ReleaseTag, string> = {
  launch: "Launch",
  feature: "New feature",
  improvement: "Improvements",
  fix: "Fixes",
};

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ReleaseLogPage() {
  await requireAdmin();

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Release log
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          A running list of what we have shipped on Becca&apos;s Knotique, newest
          first. Only you can see this page.
        </p>
      </div>

      <ol className="relative mx-auto max-w-2xl border-l border-stone-200">
        {releases.map((r) => (
          <li key={r.date + r.title} className="relative ml-6 pb-10 last:pb-0">
            {/* node */}
            <span className="absolute top-1.5 -left-[31px] flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-emerald-600 bg-white" />

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <time className="text-sm font-semibold text-stone-900">
                {formatDate(r.date)}
              </time>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tagStyles[r.tag]}`}
              >
                {tagLabels[r.tag]}
              </span>
            </div>

            <h2 className="mt-1 text-lg font-semibold text-stone-900">
              {r.title}
            </h2>

            <ul className="mt-3 space-y-2">
              {r.items.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-2.5 text-sm leading-relaxed text-stone-600"
                >
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
