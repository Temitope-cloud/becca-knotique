"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { signOut } from "next-auth/react";
import { Loader2, Trash2 } from "lucide-react";
import { formatNaira } from "@/lib/money";

const REASONS = [
  "I no longer shop here",
  "I created a duplicate account",
  "Privacy concerns",
  "Too many emails",
  "I had a bad experience",
  "Just taking a break",
  "Other",
];

export default function DeleteAccountButton({
  storeCredit = 0,
  pendingRefunds = 0,
}: {
  storeCredit?: number;
  pendingRefunds?: number;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  async function confirmDelete() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, comment }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Could not delete your account.");
        setBusy(false);
        return;
      }
      await signOut({ callbackUrl: "/" });
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-rose-300 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
      >
        <Trash2 className="h-4 w-4" />
        Delete my account
      </button>
      {error && !open ? (
        <p className="mt-2 text-sm text-rose-700">{error}</p>
      ) : null}

      {open && mounted
        ? createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-stone-900">
              Delete your account?
            </h3>
            <div className="mt-2 space-y-1.5 text-sm text-stone-600">
              <p>This permanently deletes your account and sign-in.</p>
              {storeCredit > 0 ? (
                <p className="font-medium text-rose-700">
                  You will lose your store credit of {formatNaira(storeCredit)}.
                </p>
              ) : null}
              {pendingRefunds > 0 ? (
                <p className="font-medium text-amber-700">
                  You have a refund request still under review.
                </p>
              ) : null}
              <p>This cannot be undone.</p>
            </div>

            <div className="mt-5">
              <label className="mb-1.5 block text-sm font-medium text-stone-700">
                Mind telling us why? (optional)
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
              >
                <option value="">Prefer not to say</option>
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Anything else you'd like us to know? (optional)"
                className="mt-2 w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
              />
            </div>

            {error ? (
              <p className="mt-3 text-sm text-rose-700">{error}</p>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={busy}
                className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 disabled:opacity-60"
              >
                Keep my account
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-70"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  "Delete my account"
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )
        : null}
    </div>
  );
}
