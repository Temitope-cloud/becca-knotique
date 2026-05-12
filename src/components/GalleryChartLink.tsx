import Link from "next/link";
import { BarChart3 } from "lucide-react";

/**
 * Compact CTA under product gallery linking to personal most-viewed chart.
 */
export default function GalleryChartLink() {
  return (
    <Link
      href="/products/chart"
      className="group relative mt-5 flex items-stretch gap-0 overflow-hidden rounded-2xl border border-stone-200/90 bg-linear-to-br from-white via-stone-50 to-amber-50/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition hover:border-stone-300 hover:shadow-md"
    >
      <div
        className="w-1 shrink-0 bg-linear-to-b from-amber-600/85 via-stone-600/70 to-amber-700/75"
        aria-hidden
      />
      <div className="flex min-w-0 flex-1 items-center gap-3 px-3.5 py-3.5 sm:gap-4 sm:px-4 sm:py-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-stone-200/80 bg-white shadow-sm ring-1 ring-black/4 transition group-hover:border-amber-200 group-hover:bg-amber-50/60">
          <BarChart3
            className="h-[1.15rem] w-[1.15rem] text-stone-700 transition group-hover:text-amber-950"
            strokeWidth={2}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] font-medium tracking-[0.2em] text-stone-500 uppercase">
            This device only
          </p>
          <p className="mt-0.5 truncate text-[15px] font-semibold tracking-tight text-stone-900 sm:text-base">
            See your stitch chart
          </p>
          <p className="mt-0.5 text-xs leading-snug text-stone-600">
            Open the ranking from your browsing
          </p>
        </div>
        <div
          className="flex h-11 shrink-0 items-end gap-1.5 pr-0.5 opacity-40 transition-opacity group-hover:opacity-65"
          aria-hidden
        >
          <span className="h-4 w-1.5 rounded-full bg-stone-700" />
          <span className="h-8 w-1.5 rounded-full bg-stone-900" />
          <span className="h-4.5 w-1.5 rounded-full bg-stone-600" />
        </div>
      </div>
    </Link>
  );
}
