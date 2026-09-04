"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw, Check } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

const REASONS = [
  "Arrived damaged or faulty",
  "Wrong item, colour, or size",
  "Not as described",
  "Never arrived",
  "Changed my mind",
  "Other",
];

export default function RefundRequestForm({ orderRef }: { orderRef: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/account/refund-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderRef, reason, note, photos }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Could not send your request.");
        setBusy(false);
        return;
      }
      setDone(true);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
        <Check className="h-4 w-4" /> Refund request sent. We&apos;ll review it
        and be in touch.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 underline underline-offset-4 hover:text-stone-900"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Request a refund or return
      </button>
    );
  }

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-stone-600">
          Reason
        </label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-900"
        >
          {REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-stone-600">
          Tell us more (optional)
        </label>
        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What went wrong?"
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-900"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-stone-600">
          Photos (optional — helps if it arrived damaged)
        </label>
        <ImageUploader value={photos} onChange={setPhotos} />
      </div>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Send request
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          disabled={busy}
          className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
