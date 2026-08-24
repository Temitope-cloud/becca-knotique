"use client";

import { useEffect, useState } from "react";
import { Ruler, X } from "lucide-react";

/**
 * Illustrated "how to measure" helper. Crochet sizing uses terms most shoppers
 * don't know (head circumference, bust, hip, strap drop…), so each measurement
 * field can point at one of these simple line diagrams with plain-language steps.
 */

type Guide = {
  title: string;
  steps: string[];
  Diagram: () => React.ReactElement;
};

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const dashed = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.5,
  strokeDasharray: "5 5",
  strokeLinecap: "round" as const,
};

/** A shared torso silhouette with a measuring line at a given height. */
function Torso({ lineY, label }: { lineY: number; label: string }) {
  return (
    <svg viewBox="0 0 200 200" className="h-44 w-full text-stone-700">
      {/* head */}
      <circle cx="100" cy="30" r="16" {...stroke} />
      {/* torso outline */}
      <path
        d="M70 55 Q100 48 130 55 L140 90 Q142 120 132 165 L68 165 Q58 120 60 90 Z"
        {...stroke}
      />
      {/* arms */}
      <path d="M70 58 L48 110" {...stroke} />
      <path d="M130 58 L152 110" {...stroke} />
      {/* measuring line */}
      <line x1="40" y1={lineY} x2="160" y2={lineY} {...dashed} />
      <circle cx="40" cy={lineY} r="3" fill="currentColor" />
      <circle cx="160" cy={lineY} r="3" fill="currentColor" />
      <text
        x="100"
        y={lineY - 8}
        textAnchor="middle"
        className="fill-stone-500"
        fontSize="12"
        fontWeight="600"
      >
        {label}
      </text>
    </svg>
  );
}

function DoubleArrow({
  orientation,
  label,
}: {
  orientation: "h" | "v";
  label: string;
}) {
  return (
    <svg viewBox="0 0 200 160" className="h-40 w-full text-stone-700">
      <rect x="40" y="45" width="120" height="70" rx="8" {...stroke} />
      {orientation === "h" ? (
        <>
          <line x1="40" y1="130" x2="160" y2="130" {...dashed} />
          <path d="M40 130 L48 125 M40 130 L48 135" {...stroke} />
          <path d="M160 130 L152 125 M160 130 L152 135" {...stroke} />
          <text
            x="100"
            y="150"
            textAnchor="middle"
            className="fill-stone-500"
            fontSize="12"
            fontWeight="600"
          >
            {label}
          </text>
        </>
      ) : (
        <>
          <line x1="175" y1="45" x2="175" y2="115" {...dashed} />
          <path d="M175 45 L170 53 M175 45 L180 53" {...stroke} />
          <path d="M175 115 L170 107 M175 115 L180 107" {...stroke} />
          <text
            x="185"
            y="84"
            textAnchor="middle"
            className="fill-stone-500"
            fontSize="12"
            fontWeight="600"
            transform="rotate(90 185 84)"
          >
            {label}
          </text>
        </>
      )}
    </svg>
  );
}

export const MEASURE_GUIDES: Record<string, Guide> = {
  head: {
    title: "Head circumference",
    steps: [
      "Wrap a soft tape around the widest part of your head.",
      "Keep it just above the ears and eyebrows, around the back.",
      "Snug, not tight — that number is the circumference.",
    ],
    Diagram: () => (
      <svg viewBox="0 0 200 180" className="h-44 w-full text-stone-700">
        {/* head from the front */}
        <ellipse cx="100" cy="95" rx="46" ry="56" {...stroke} />
        {/* ears */}
        <path d="M54 95 q-10 0 -8 14 q8 6 10 -2" {...stroke} />
        <path d="M146 95 q10 0 8 14 q-8 6 -10 -2" {...stroke} />
        {/* tape around widest part */}
        <ellipse cx="100" cy="86" rx="54" ry="16" {...dashed} />
        <text
          x="100"
          y="30"
          textAnchor="middle"
          className="fill-stone-500"
          fontSize="12"
          fontWeight="600"
        >
          Around the widest part
        </text>
      </svg>
    ),
  },
  diameter: {
    title: "Flat diameter",
    steps: [
      "Lay the piece flat (a beanie crown or a doily).",
      "Measure straight across the middle, edge to edge.",
      "That straight-across number is the diameter.",
    ],
    Diagram: () => (
      <svg viewBox="0 0 200 170" className="h-44 w-full text-stone-700">
        <circle cx="100" cy="90" r="55" {...stroke} />
        <line x1="45" y1="90" x2="155" y2="90" {...dashed} />
        <circle cx="45" cy="90" r="3" fill="currentColor" />
        <circle cx="155" cy="90" r="3" fill="currentColor" />
        <text
          x="100"
          y="80"
          textAnchor="middle"
          className="fill-stone-500"
          fontSize="12"
          fontWeight="600"
        >
          Straight across
        </text>
      </svg>
    ),
  },
  bust: {
    title: "Bust / chest",
    steps: [
      "Wrap the tape around the fullest part of the chest.",
      "Keep it level and parallel to the floor.",
      "Breathe normally — don't pull the tape tight.",
    ],
    Diagram: () => <Torso lineY={95} label="Fullest part" />,
  },
  chest: {
    title: "Chest",
    steps: [
      "Wrap the tape around the fullest part of the chest.",
      "Keep it level all the way around.",
      "Snug but comfortable.",
    ],
    Diagram: () => <Torso lineY={95} label="Around chest" />,
  },
  waist: {
    title: "Waist",
    steps: [
      "Find the narrowest part of your waist (near the navel).",
      "Wrap the tape around, keeping it level.",
      "Don't suck in — measure relaxed.",
    ],
    Diagram: () => <Torso lineY={120} label="Narrowest part" />,
  },
  hips: {
    title: "Hips",
    steps: [
      "Stand with your feet together.",
      "Wrap the tape around the fullest part of your hips.",
      "Keep it level front to back.",
    ],
    Diagram: () => <Torso lineY={150} label="Fullest part" />,
  },
  length: {
    title: "Length",
    steps: [
      "Decide where you want the piece to start and end.",
      "Measure straight down between those two points.",
      "For tops, measure from the shoulder down.",
    ],
    Diagram: () => (
      <svg viewBox="0 0 200 190" className="h-44 w-full text-stone-700">
        <path
          d="M70 40 Q100 33 130 40 L140 80 Q142 120 132 170 L68 170 Q58 120 60 80 Z"
          {...stroke}
        />
        <line x1="30" y1="40" x2="30" y2="170" {...dashed} />
        <path d="M30 40 L25 48 M30 40 L35 48" {...stroke} />
        <path d="M30 170 L25 162 M30 170 L35 162" {...stroke} />
        <text
          x="20"
          y="105"
          textAnchor="middle"
          className="fill-stone-500"
          fontSize="12"
          fontWeight="600"
          transform="rotate(-90 20 105)"
        >
          Top to bottom
        </text>
      </svg>
    ),
  },
  shoulder: {
    title: "Shoulder width",
    steps: [
      "Measure across the back, from one shoulder edge to the other.",
      "Follow the top line of the shoulders.",
      "Keep the tape flat across the back.",
    ],
    Diagram: () => (
      <svg viewBox="0 0 200 180" className="h-44 w-full text-stone-700">
        <circle cx="100" cy="34" r="15" {...stroke} />
        <path d="M55 70 Q100 55 145 70 L150 150 L50 150 Z" {...stroke} />
        <line x1="55" y1="66" x2="145" y2="66" {...dashed} />
        <circle cx="55" cy="66" r="3" fill="currentColor" />
        <circle cx="145" cy="66" r="3" fill="currentColor" />
        <text
          x="100"
          y="58"
          textAnchor="middle"
          className="fill-stone-500"
          fontSize="12"
          fontWeight="600"
        >
          Shoulder to shoulder
        </text>
      </svg>
    ),
  },
  sleeve: {
    title: "Sleeve length",
    steps: [
      "Relax your arm at your side with a slight bend.",
      "Measure from the shoulder edge to your wrist.",
      "Follow the outside of the arm.",
    ],
    Diagram: () => (
      <svg viewBox="0 0 200 180" className="h-44 w-full text-stone-700">
        <path d="M70 40 L70 150 L120 150 L120 40" {...stroke} />
        <path d="M120 55 L165 90 L160 140" {...stroke} />
        <line x1="120" y1="48" x2="168" y2="86" {...dashed} />
        <line x1="168" y1="86" x2="164" y2="140" {...dashed} />
        <text
          x="150"
          y="40"
          textAnchor="middle"
          className="fill-stone-500"
          fontSize="12"
          fontWeight="600"
        >
          Shoulder → wrist
        </text>
      </svg>
    ),
  },
  width: {
    title: "Width",
    steps: [
      "Lay the item flat.",
      "Measure straight across, side to side.",
    ],
    Diagram: () => <DoubleArrow orientation="h" label="Side to side" />,
  },
  height: {
    title: "Height",
    steps: [
      "Lay or stand the item upright.",
      "Measure straight from top to bottom.",
    ],
    Diagram: () => <DoubleArrow orientation="v" label="Top to bottom" />,
  },
  strap: {
    title: "Strap drop",
    steps: [
      "For a bag, decide how low it should hang.",
      "Measure from the top of the strap to the top of the bag.",
      "That drop is how far it sits below your shoulder.",
    ],
    Diagram: () => (
      <svg viewBox="0 0 200 190" className="h-44 w-full text-stone-700">
        <path d="M75 120 Q60 60 100 55 Q140 60 125 120" {...stroke} />
        <rect x="65" y="120" width="70" height="55" rx="6" {...stroke} />
        <line x1="40" y1="55" x2="40" y2="120" {...dashed} />
        <path d="M40 55 L35 63 M40 55 L45 63" {...stroke} />
        <path d="M40 120 L35 112 M40 120 L45 112" {...stroke} />
        <text
          x="28"
          y="90"
          textAnchor="middle"
          className="fill-stone-500"
          fontSize="12"
          fontWeight="600"
          transform="rotate(-90 28 90)"
        >
          Drop
        </text>
      </svg>
    ),
  },
  foot: {
    title: "Foot length",
    steps: [
      "Stand on a sheet of paper.",
      "Mark the tip of your longest toe and your heel.",
      "Measure the straight distance between the two marks.",
    ],
    Diagram: () => (
      <svg viewBox="0 0 200 170" className="h-44 w-full text-stone-700">
        <path
          d="M70 40 Q90 35 92 60 Q94 110 88 130 Q80 145 68 138 Q58 120 60 90 Q60 55 70 40 Z"
          {...stroke}
        />
        <line x1="120" y1="40" x2="120" y2="138" {...dashed} />
        <path d="M120 40 L115 48 M120 40 L125 48" {...stroke} />
        <path d="M120 138 L115 130 M120 138 L125 130" {...stroke} />
        <text
          x="140"
          y="90"
          textAnchor="middle"
          className="fill-stone-500"
          fontSize="12"
          fontWeight="600"
          transform="rotate(90 140 90)"
        >
          Heel → toe
        </text>
      </svg>
    ),
  },
};

/** Default guide when a field's `guide` key isn't recognised. */
const GENERIC: Guide = {
  title: "How to measure",
  steps: [
    "Use a soft measuring tape.",
    "Keep the tape flat and level.",
    "Snug, not tight — measure over light clothing.",
  ],
  Diagram: () => (
    <svg viewBox="0 0 200 120" className="h-32 w-full text-stone-700">
      <rect x="20" y="45" width="160" height="30" rx="6" {...stroke} />
      {[40, 60, 80, 100, 120, 140, 160].map((x) => (
        <line key={x} x1={x} y1="45" x2={x} y2="58" {...stroke} />
      ))}
    </svg>
  ),
};

export function guideFor(key?: string): Guide {
  if (key && MEASURE_GUIDES[key]) return MEASURE_GUIDES[key];
  return GENERIC;
}

export default function MeasureGuideButton({
  guide,
  fieldLabel,
}: {
  guide?: string;
  fieldLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const g = guideFor(guide);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 underline underline-offset-2 transition hover:text-emerald-900"
      >
        <Ruler className="h-3.5 w-3.5" />
        How to measure
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`How to measure ${fieldLabel ?? g.title}`}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-stone-900">
                {fieldLabel ?? g.title}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-md p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-center rounded-xl border border-stone-100 bg-stone-50 p-4">
              <g.Diagram />
            </div>

            <ol className="mt-4 space-y-2">
              {g.steps.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-stone-600">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-900 text-[11px] font-semibold text-white">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-5 w-full rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              Got it
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
