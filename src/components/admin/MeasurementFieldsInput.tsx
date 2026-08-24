"use client";

import { useState } from "react";
import { Plus, X, Check } from "lucide-react";

export interface MeasurementField {
  label: string;
  unit?: string;
  guide?: string;
}

// Guide keys that have an illustrated "how to measure" diagram.
const GUIDE_KEYS = [
  "head",
  "diameter",
  "bust",
  "chest",
  "waist",
  "hips",
  "length",
  "shoulder",
  "sleeve",
  "width",
  "height",
  "strap",
  "foot",
];

// Common tailor measurements. Grouped only for ordering; shown as one chip set.
const PRESETS: MeasurementField[] = [
  { label: "Head circumference", guide: "head", unit: "cm" },
  { label: "Diameter", guide: "diameter", unit: "cm" },
  { label: "Bust", guide: "bust", unit: "cm" },
  { label: "Chest", guide: "chest", unit: "cm" },
  { label: "Waist", guide: "waist", unit: "cm" },
  { label: "Hips", guide: "hips", unit: "cm" },
  { label: "Shoulder", guide: "shoulder", unit: "cm" },
  { label: "Sleeve length", guide: "sleeve", unit: "cm" },
  { label: "Length", guide: "length", unit: "cm" },
  { label: "Width", guide: "width", unit: "cm" },
  { label: "Height", guide: "height", unit: "cm" },
  { label: "Strap", guide: "strap", unit: "cm" },
  { label: "Foot length", guide: "foot", unit: "cm" },
  { label: "Neck", guide: undefined, unit: "cm" },
  { label: "Thigh", guide: undefined, unit: "cm" },
  { label: "Inseam", guide: "length", unit: "cm" },
];

function detectGuide(label: string): string | undefined {
  const l = label.toLowerCase();
  return GUIDE_KEYS.find((k) => l.includes(k));
}

export default function MeasurementFieldsInput({
  value,
  onChange,
}: {
  value: MeasurementField[];
  onChange: (v: MeasurementField[]) => void;
}) {
  const [custom, setCustom] = useState("");

  const has = (label: string) =>
    value.some((v) => v.label.toLowerCase() === label.toLowerCase());
  const add = (f: MeasurementField) => {
    if (!has(f.label)) onChange([...value, f]);
  };
  const remove = (label: string) =>
    onChange(value.filter((v) => v.label.toLowerCase() !== label.toLowerCase()));
  const toggle = (f: MeasurementField) =>
    has(f.label) ? remove(f.label) : add(f);

  const addCustom = () => {
    const label = custom.trim();
    if (!label) return;
    if (!has(label)) add({ label, unit: "cm", guide: detectGuide(label) });
    setCustom("");
  };

  return (
    <div>
      {/* selected */}
      {value.length ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {value.map((f) => (
            <span
              key={f.label}
              className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-3 py-1.5 text-sm font-medium text-white"
            >
              {f.label}
              {f.unit ? (
                <span className="text-white/60">({f.unit})</span>
              ) : null}
              <button
                type="button"
                onClick={() => remove(f.label)}
                aria-label={`Remove ${f.label}`}
                className="rounded-full p-0.5 transition hover:bg-white/20"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="mb-3 text-sm text-stone-400">
          No measurements yet. Pick common ones below or add your own.
        </p>
      )}

      {/* presets */}
      <p className="mb-2 text-xs font-medium tracking-wide text-stone-500 uppercase">
        Common measurements
      </p>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => {
          const active = has(p.label);
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => toggle(p)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                active
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-300 text-stone-700 hover:border-stone-500"
              }`}
            >
              {active ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              {p.label}
            </button>
          );
        })}
      </div>

      {/* custom */}
      <div className="mt-4 flex gap-2">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder="Add your own (e.g. Ankle, Cuff)"
          className="min-w-0 flex-1 rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
        />
        <button
          type="button"
          onClick={addCustom}
          className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-stone-900 px-4 py-2.5 text-sm font-semibold text-stone-900 transition hover:bg-stone-900 hover:text-white"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
      <p className="mt-2 text-xs text-stone-400">
        Customers fill these on the product page. Where a matching diagram
        exists, they see a &ldquo;how to measure&rdquo; guide automatically.
      </p>
    </div>
  );
}
