"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";
import { formatNaira } from "@/lib/money";

interface RefundRecord {
  amount: number;
  reason: string;
  method: string;
  note?: string;
  createdAt: string;
}

const METHOD_LABELS: Record<string, string> = {
  store_credit: "Store credit",
  paystack: "Paystack (card)",
  manual: "Manual / cash",
};

const REASONS = [
  "Damaged on arrival",
  "Wrong item or colour",
  "Not as described",
  "Never delivered",
  "Order cancelled",
  "Goodwill / other",
];

export default function RefundPanel({
  reference,
  amount,
  refundedAmount,
  refunds,
  hasCustomer,
  paystackRefundable,
}: {
  reference: string;
  amount: number;
  refundedAmount: number;
  refunds: RefundRecord[];
  hasCustomer: boolean;
  paystackRefundable: number;
}) {
  const router = useRouter();
  const refundable = Math.max(0, amount - refundedAmount);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(String(refundable));
  const [method, setMethod] = useState<string>(
    hasCustomer ? "store_credit" : "paystack",
  );
  const [reason, setReason] = useState(REASONS[0]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    const amt = Math.round(Number(value));
    if (!amt || amt <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (amt > refundable) {
      setError(`You can refund at most ${formatNaira(refundable)}.`);
      return;
    }
    if (
      !confirm(
        `Refund ${formatNaira(amt)} via ${METHOD_LABELS[method]} for order ${reference}?`,
      )
    )
      return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/admin/orders/${encodeURIComponent(reference)}/refund`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: amt, reason, method, note }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Could not process the refund.");
        setBusy(false);
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-stone-900">Refunds</h2>
        {refundedAmount > 0 ? (
          <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
            {formatNaira(refundedAmount)} refunded
          </span>
        ) : null}
      </div>

      <dl className="mt-4 space-y-1.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-stone-500">Charged</dt>
          <dd className="text-stone-800">{formatNaira(amount)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-stone-500">Refunded</dt>
          <dd className="text-stone-800">{formatNaira(refundedAmount)}</dd>
        </div>
        <div className="flex justify-between border-t border-stone-100 pt-1.5 font-semibold">
          <dt className="text-stone-700">Refundable</dt>
          <dd className="text-stone-900">{formatNaira(refundable)}</dd>
        </div>
      </dl>

      {refunds.length > 0 ? (
        <ul className="mt-4 space-y-2 border-t border-stone-100 pt-4">
          {refunds.map((r, i) => (
            <li key={i} className="text-xs text-stone-600">
              <div className="flex justify-between">
                <span className="font-medium text-stone-800">
                  {formatNaira(r.amount)} · {METHOD_LABELS[r.method] ?? r.method}
                </span>
                <span className="text-stone-400">
                  {new Date(r.createdAt).toLocaleDateString("en-NG", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <p className="text-stone-500">
                {r.reason}
                {r.note ? ` — ${r.note}` : ""}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      {refundable > 0 ? (
        !open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
          >
            <RotateCcw className="h-4 w-4" /> Issue a refund
          </button>
        ) : (
          <div className="mt-4 space-y-3 border-t border-stone-100 pt-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">
                Amount (₦)
              </label>
              <input
                type="number"
                min={1}
                max={refundable}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">
                Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900"
              >
                <option value="store_credit" disabled={!hasCustomer}>
                  Store credit{hasCustomer ? "" : " (guest — unavailable)"}
                </option>
                <option value="paystack" disabled={paystackRefundable <= 0}>
                  Paystack card refund
                  {paystackRefundable > 0
                    ? ` (up to ${formatNaira(paystackRefundable)})`
                    : " (nothing card-paid)"}
                </option>
                <option value="manual">Manual / cash (record only)</option>
              </select>
              <p className="mt-1 text-[11px] text-stone-400">
                Store credit and card refunds are actioned automatically. “Manual
                / cash” only records it here — pay the customer yourself.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">
                Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900"
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
                Note (optional)
              </label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Anything worth remembering"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900"
              />
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
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Refund {formatNaira(Math.round(Number(value) || 0))}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setError(null);
                }}
                disabled={busy}
                className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-100"
              >
                Cancel
              </button>
            </div>
          </div>
        )
      ) : refundedAmount > 0 ? (
        <p className="mt-4 rounded-lg bg-stone-50 px-3 py-2 text-center text-xs text-stone-500">
          Fully refunded.
        </p>
      ) : null}
    </div>
  );
}
