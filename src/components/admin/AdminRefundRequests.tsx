"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, X } from "lucide-react";
import { formatNaira } from "@/lib/money";
import { useConfirm } from "@/components/ui/confirm";

interface RequestRow {
  id: string;
  amount: number;
  reason: string;
  note?: string;
  photos: string[];
  email: string;
  createdAt: string;
}

export default function AdminRefundRequests({
  requests,
  refundable,
  hasCustomer,
}: {
  requests: RequestRow[];
  refundable: number;
  hasCustomer: boolean;
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [methods, setMethods] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  if (requests.length === 0) return null;

  async function act(r: RequestRow, action: "approve" | "decline") {
    const id = r.id;
    setError(null);
    // Mirror the input's shown default when the field hasn't been edited.
    const defaultAmount = Math.min(r.amount, refundable);
    const payload =
      action === "approve"
        ? {
            action,
            amount: Math.round(Number(amounts[id] ?? defaultAmount)),
            method: methods[id] ?? (hasCustomer ? "store_credit" : "paystack"),
            note: notes[id] || undefined,
          }
        : { action, note: notes[id] || undefined };

    if (action === "approve") {
      const amt = (payload as { amount: number }).amount;
      if (!amt || amt <= 0) {
        setError("Enter an amount to approve.");
        return;
      }
      const ok = await confirm({
        title: "Approve refund?",
        description: `Approve and refund ${formatNaira(amt)} for this request.`,
        confirmText: "Approve & refund",
      });
      if (!ok) return;
    }

    setBusy(`${action}:${id}`);
    try {
      const res = await fetch(`/api/admin/refund-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Could not update the request.");
        setBusy(null);
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setBusy(null);
    }
  }

  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50/60 p-5">
      <h2 className="font-semibold text-stone-900">
        Refund request{requests.length > 1 ? "s" : ""} to review
      </h2>

      {error ? (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </p>
      ) : null}

      <ul className="mt-4 space-y-4">
        {requests.map((r) => (
          <li
            key={r.id}
            className="rounded-xl border border-amber-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-stone-900">
                  {r.reason}
                </p>
                <p className="text-xs text-stone-500">{r.email}</p>
              </div>
              <span className="text-xs text-stone-400">
                {new Date(r.createdAt).toLocaleDateString("en-NG", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            {r.note ? (
              <p className="mt-2 text-sm text-stone-600">“{r.note}”</p>
            ) : null}
            {r.photos.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {r.photos.map((p) => (
                  <a
                    key={p}
                    href={p}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-emerald-700 underline underline-offset-2"
                  >
                    View photo
                  </a>
                ))}
              </div>
            ) : null}

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-stone-500">
                  Refund amount (₦)
                </label>
                <input
                  type="number"
                  min={1}
                  max={refundable}
                  value={amounts[r.id] ?? String(Math.min(r.amount, refundable))}
                  onChange={(e) =>
                    setAmounts((a) => ({ ...a, [r.id]: e.target.value }))
                  }
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-stone-500">
                  Method
                </label>
                <select
                  value={
                    methods[r.id] ?? (hasCustomer ? "store_credit" : "paystack")
                  }
                  onChange={(e) =>
                    setMethods((m) => ({ ...m, [r.id]: e.target.value }))
                  }
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900"
                >
                  <option value="store_credit" disabled={!hasCustomer}>
                    Store credit
                  </option>
                  <option value="paystack">Paystack card</option>
                  <option value="manual">Manual / cash</option>
                </select>
              </div>
            </div>
            <input
              value={notes[r.id] ?? ""}
              onChange={(e) =>
                setNotes((n) => ({ ...n, [r.id]: e.target.value }))
              }
              placeholder="Note to customer (optional)"
              className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900"
            />

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => act(r, "approve")}
                disabled={busy !== null}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {busy === `approve:${r.id}` ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Approve & refund
              </button>
              <button
                type="button"
                onClick={() => act(r, "decline")}
                disabled={busy !== null}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 disabled:opacity-60"
              >
                {busy === `decline:${r.id}` ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                Decline
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
