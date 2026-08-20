"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Plus } from "lucide-react";
import { formatNaira } from "@/lib/money";

export interface CouponRow {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrder: number;
  usageLimit: number;
  timesUsed: number;
  expiresAt: string | null;
  active: boolean;
}

export default function CouponManager({ coupons }: { coupons: CouponRow[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    code: "",
    type: "percentage",
    value: "",
    minOrder: "",
    usageLimit: "",
    expiresAt: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const input =
    "w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-stone-900";

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          type: form.type,
          value: Number(form.value),
          minOrder: form.minOrder ? Number(form.minOrder) : 0,
          usageLimit: form.usageLimit ? Number(form.usageLimit) : 0,
          expiresAt: form.expiresAt || undefined,
          active: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Could not create coupon.");
        setSaving(false);
        return;
      }
      setForm({ code: "", type: "percentage", value: "", minOrder: "", usageLimit: "", expiresAt: "" });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function toggle(c: CouponRow) {
    await fetch(`/api/admin/coupons/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this coupon?")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      {/* create form */}
      <form
        onSubmit={create}
        className="h-fit space-y-3 rounded-2xl border border-stone-200 bg-white p-5"
      >
        <h2 className="font-semibold text-stone-900">New coupon</h2>
        <input
          required
          placeholder="CODE (e.g. WELCOME10)"
          value={form.code}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
          className={input}
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className={input}
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed ₦</option>
          </select>
          <input
            required
            type="number"
            min="0"
            placeholder={form.type === "percentage" ? "% off" : "₦ off"}
            value={form.value}
            onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
            className={input}
          />
        </div>
        <input
          type="number"
          min="0"
          placeholder="Minimum order (₦, optional)"
          value={form.minOrder}
          onChange={(e) => setForm((f) => ({ ...f, minOrder: e.target.value }))}
          className={input}
        />
        <input
          type="number"
          min="0"
          placeholder="Usage limit (0 = unlimited)"
          value={form.usageLimit}
          onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
          className={input}
        />
        <div>
          <label className="mb-1 block text-xs text-stone-500">Expires (optional)</label>
          <input
            type="date"
            value={form.expiresAt}
            onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
            className={input}
          />
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Create coupon
        </button>
      </form>

      {/* list */}
      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-xs tracking-wide text-stone-500 uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Discount</th>
              <th className="px-4 py-3 font-medium">Used</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-stone-500">
                  No coupons yet.
                </td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-stone-100 px-2 py-1 font-mono text-xs font-semibold text-stone-800">
                      {c.code}
                    </span>
                    {c.minOrder ? (
                      <p className="mt-1 text-xs text-stone-400">
                        min {formatNaira(c.minOrder)}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 font-medium text-stone-900">
                    {c.type === "percentage"
                      ? `${c.value}%`
                      : formatNaira(c.value)}
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {c.timesUsed}
                    {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggle(c)}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        c.active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-stone-200 text-stone-600"
                      }`}
                    >
                      {c.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => remove(c.id)}
                      aria-label="Delete coupon"
                      className="rounded-md p-1.5 text-stone-400 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
