"use client";

import { useState } from "react";
import { Loader2, Plus, Power, RotateCcw } from "lucide-react";
import { useConfirm } from "@/components/ui/confirm";
import { formatNaira } from "@/lib/money";

type CustomerActionsProps = {
  customerId: string;
  name: string;
  initialCredit: number;
  initialActive: boolean;
};

export default function CustomerActions({
  customerId,
  name,
  initialCredit,
  initialActive,
}: CustomerActionsProps) {
  const confirm = useConfirm();
  const [credit, setCredit] = useState(initialCredit);
  const [active, setActive] = useState(initialActive);
  const [showCredit, setShowCredit] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("Courtesy store credit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function request(body: Record<string, unknown>) {
    const response = await fetch(`/api/admin/customers/${customerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Something went wrong.");
    return data;
  }

  async function addCredit(e: React.FormEvent) {
    e.preventDefault();
    const value = Math.round(Number(amount));
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter a whole amount greater than zero.");
      return;
    }
    if (note.trim().length < 2) {
      setError("Add a short note for this credit.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const data = await request({ action: "add_credit", amount: value, note: note.trim() });
      setCredit(Number(data.balance) || 0);
      setAmount("");
      setShowCredit(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add credit.");
    } finally {
      setSaving(false);
    }
  }

  async function changeActive() {
    const next = !active;
    const ok = await confirm({
      title: next ? "Reactivate customer?" : "Deactivate customer?",
      description: next
        ? `${name} will be able to sign in and place orders again.`
        : `${name} will no longer be able to sign in or place new orders until you reactivate them. Their order history and credit remain intact.`,
      confirmText: next ? "Reactivate" : "Deactivate",
      destructive: !next,
    });
    if (!ok) return;

    setSaving(true);
    setError("");
    try {
      const data = await request({ action: "set_active", isActive: next });
      setActive(Boolean(data.isActive));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update this customer.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-w-[190px] space-y-2">
      <p className="text-xs text-stone-500">
        Credit: <span className="font-semibold text-stone-900">{formatNaira(credit)}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => { setShowCredit((open) => !open); setError(""); }}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-100 disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" /> Add credit
        </button>
        <button
          type="button"
          onClick={changeActive}
          disabled={saving}
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
            active
              ? "border border-rose-200 text-rose-700 hover:bg-rose-50"
              : "bg-stone-900 text-white hover:bg-stone-800"
          }`}
        >
          {active ? <Power className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
          {active ? "Deactivate" : "Reactivate"}
        </button>
      </div>
      {!active ? <p className="text-xs font-medium text-rose-700">Account deactivated</p> : null}
      {showCredit ? (
        <form onSubmit={addCredit} className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-3">
          <label className="block text-xs font-medium text-stone-700">
            Credit amount (₦)
            <input
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-stone-900"
            />
          </label>
          <label className="block text-xs font-medium text-stone-700">
            Note
            <input
              value={note}
              maxLength={240}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-stone-900"
            />
          </label>
          {error ? <p className="text-xs text-rose-700">{error}</p> : null}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Add store credit
          </button>
        </form>
      ) : null}
      {!showCredit && error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}
