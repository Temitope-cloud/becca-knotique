"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import type { StoreSettings } from "@/lib/settings";

export default function SettingsForm({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const [form, setForm] = useState({
    storeName: settings.storeName,
    supportEmail: settings.supportEmail,
    supportPhone: settings.supportPhone,
    announcement: settings.announcement,
    shippingFee: settings.shippingFee.toString(),
    freeShippingThreshold: settings.freeShippingThreshold.toString(),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setSaved(false);
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: form.storeName,
          supportEmail: form.supportEmail,
          supportPhone: form.supportPhone,
          announcement: form.announcement,
          shippingFee: Number(form.shippingFee) || 0,
          freeShippingThreshold: Number(form.freeShippingThreshold) || 0,
        }),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  const input =
    "w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-stone-900";
  const label = "mb-1.5 block text-sm font-medium text-stone-700";

  return (
    <form onSubmit={save} className="max-w-2xl space-y-6">
      <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <h2 className="font-semibold text-stone-900">Store</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className={label}>Store name</label>
            <input value={form.storeName} onChange={set("storeName")} className={input} />
          </div>
          <div>
            <label className={label}>Announcement banner (optional)</label>
            <input
              value={form.announcement}
              onChange={set("announcement")}
              placeholder="e.g. Free shipping on orders over ₦100,000"
              className={input}
            />
            <p className="mt-1 text-xs text-stone-400">
              Shows across the top of the store when set.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Support email</label>
              <input value={form.supportEmail} onChange={set("supportEmail")} className={input} />
            </div>
            <div>
              <label className={label}>Support / WhatsApp phone</label>
              <input value={form.supportPhone} onChange={set("supportPhone")} className={input} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <h2 className="font-semibold text-stone-900">Shipping</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Delivery fee (₦)</label>
            <input
              type="number"
              min="0"
              value={form.shippingFee}
              onChange={set("shippingFee")}
              className={input}
            />
            <p className="mt-1 text-xs text-stone-400">0 = arranged after checkout.</p>
          </div>
          <div>
            <label className={label}>Free shipping over (₦)</label>
            <input
              type="number"
              min="0"
              value={form.freeShippingThreshold}
              onChange={set("freeShippingThreshold")}
              className={input}
            />
            <p className="mt-1 text-xs text-stone-400">0 = disabled.</p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : saved ? (
          <Check className="h-4 w-4" />
        ) : null}
        {saved ? "Saved" : "Save settings"}
      </button>
    </form>
  );
}
