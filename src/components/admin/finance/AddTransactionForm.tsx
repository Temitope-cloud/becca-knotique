"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import type { FinanceType } from "@/lib/models/FinanceTransaction";

export default function AddTransactionForm({
  types,
  defaultType,
  categories,
  heading = "Add entry",
}: {
  types: { value: FinanceType; label: string }[];
  defaultType: FinanceType;
  categories?: string[];
  heading?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: defaultType,
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const set =
    (k: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/finance/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          amount: Number(form.amount),
          description: form.description,
          category: form.category || undefined,
          date: form.date || undefined,
          notes: form.notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Could not save.");
        setSaving(false);
        return;
      }
      setForm((f) => ({ ...f, amount: "", description: "", notes: "" }));
      setOpen(false);
      setSaving(false);
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setSaving(false);
    }
  }

  const input =
    "w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10";

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800"
      >
        <Plus className="h-4 w-4" /> {heading}
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-stone-200 bg-white p-5"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-500">
            Type
          </label>
          <select value={form.type} onChange={set("type")} className={input}>
            {types.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-500">
            Amount (₦)
          </label>
          <input
            required
            type="number"
            min="0"
            step="1"
            value={form.amount}
            onChange={set("amount")}
            className={input}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-stone-500">
            Description
          </label>
          <input
            required
            value={form.description}
            onChange={set("description")}
            placeholder="e.g. Yarn purchase"
            className={input}
          />
        </div>
        {categories?.length ? (
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-500">
              Category
            </label>
            <input
              list="finance-categories"
              value={form.category}
              onChange={set("category")}
              className={input}
            />
            <datalist id="finance-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
        ) : null}
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-500">
            Date
          </label>
          <input
            type="date"
            value={form.date}
            onChange={set("date")}
            className={input}
          />
        </div>
      </div>

      {error ? (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save entry
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
