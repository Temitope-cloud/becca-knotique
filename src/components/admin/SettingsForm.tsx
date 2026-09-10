"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import type { StoreSettings } from "@/lib/settings";
import RichTextEditor from "./RichTextEditor";

type Tab = "store" | "contact" | "seo" | "policies";
type PolicyKey = "privacy" | "terms" | "refund" | "disclaimer";

const POLICY_TABS: { key: PolicyKey; label: string }[] = [
  { key: "privacy", label: "Privacy" },
  { key: "terms", label: "Terms" },
  { key: "refund", label: "Refund" },
  { key: "disclaimer", label: "Disclaimer" },
];

export default function SettingsForm({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("store");
  const [policyTab, setPolicyTab] = useState<PolicyKey>("privacy");

  const [form, setForm] = useState({
    storeName: settings.storeName,
    supportEmail: settings.supportEmail,
    supportPhone: settings.supportPhone,
    announcement: settings.announcement,
    shippingFee: settings.shippingFee.toString(),
    freeShippingThreshold: settings.freeShippingThreshold.toString(),
    address: settings.address,
    instagram: settings.instagram,
    tiktok: settings.tiktok,
    whatsapp: settings.whatsapp,
    foundedYear: settings.foundedYear,
    metaTitle: settings.metaTitle,
    metaDescription: settings.metaDescription,
  });
  const [policies, setPolicies] = useState(settings.policies);
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
          address: form.address,
          instagram: form.instagram,
          tiktok: form.tiktok,
          whatsapp: form.whatsapp,
          foundedYear: form.foundedYear,
          metaTitle: form.metaTitle,
          metaDescription: form.metaDescription,
          policies,
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
  const card = "rounded-2xl border border-stone-200 bg-white p-5 sm:p-6";
  const hint = "mt-1 text-xs text-stone-400";

  const tabs: { key: Tab; label: string }[] = [
    { key: "store", label: "Store" },
    { key: "contact", label: "Contact & Social" },
    { key: "seo", label: "SEO" },
    { key: "policies", label: "Policies" },
  ];

  return (
    <form onSubmit={save} className="max-w-2xl space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              tab === t.key
                ? "bg-stone-900 text-white"
                : "border border-stone-300 bg-white text-stone-600 hover:border-stone-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "store" ? (
        <>
          <div className={card}>
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
                <p className={hint}>Shows across the top of the store when set.</p>
              </div>
            </div>
          </div>

          <div className={card}>
            <h2 className="font-semibold text-stone-900">Shipping</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>Delivery fee (₦)</label>
                <input type="number" min="0" value={form.shippingFee} onChange={set("shippingFee")} className={input} />
                <p className={hint}>0 = arranged after checkout.</p>
              </div>
              <div>
                <label className={label}>Free shipping over (₦)</label>
                <input type="number" min="0" value={form.freeShippingThreshold} onChange={set("freeShippingThreshold")} className={input} />
                <p className={hint}>0 = disabled.</p>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {tab === "contact" ? (
        <div className={card}>
          <h2 className="font-semibold text-stone-900">Contact & social</h2>
          <p className={hint}>Shown in the footer, contact, and about pages.</p>
          <div className="mt-4 space-y-4">
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
            <div>
              <label className={label}>Address (optional)</label>
              <input value={form.address} onChange={set("address")} placeholder="e.g. Ibadan, Nigeria" className={input} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>Instagram link</label>
                <input value={form.instagram} onChange={set("instagram")} placeholder="https://instagram.com/..." className={input} />
              </div>
              <div>
                <label className={label}>TikTok link</label>
                <input value={form.tiktok} onChange={set("tiktok")} placeholder="https://tiktok.com/@..." className={input} />
              </div>
              <div>
                <label className={label}>WhatsApp link</label>
                <input value={form.whatsapp} onChange={set("whatsapp")} placeholder="https://wa.me/234..." className={input} />
              </div>
              <div>
                <label className={label}>Founded year</label>
                <input value={form.foundedYear} onChange={set("foundedYear")} placeholder="2022" className={input} />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "seo" ? (
        <div className={card}>
          <h2 className="font-semibold text-stone-900">SEO defaults</h2>
          <p className={hint}>Used by Google and social previews for the home page.</p>
          <div className="mt-4 space-y-4">
            <div>
              <label className={label}>Default page title</label>
              <input value={form.metaTitle} onChange={set("metaTitle")} maxLength={70} className={input} />
              <p className={hint}>{form.metaTitle.length}/70 characters. Keep it under ~60.</p>
            </div>
            <div>
              <label className={label}>Default description</label>
              <textarea rows={3} value={form.metaDescription} onChange={set("metaDescription")} maxLength={200} className={input} />
              <p className={hint}>{form.metaDescription.length}/200 characters. Aim for ~150.</p>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "policies" ? (
        <div className={card}>
          <h2 className="font-semibold text-stone-900">Policy pages</h2>
          <p className={hint}>
            Leave a policy empty to use the built-in default page. Add content to
            override it with your own wording.
          </p>
          <div className="mt-4 mb-3 flex flex-wrap gap-2">
            {POLICY_TABS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPolicyTab(p.key)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  policyTab === p.key
                    ? "bg-stone-100 text-stone-900"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {p.label}
                {policies[p.key]?.trim() ? (
                  <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 align-middle" />
                ) : null}
              </button>
            ))}
          </div>
          <RichTextEditor
            key={policyTab}
            value={policies[policyTab]}
            onChange={(html) => {
              setPolicies((p) => ({ ...p, [policyTab]: html }));
              setSaved(false);
            }}
          />
        </div>
      ) : null}

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
