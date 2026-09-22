"use client";

import { useEffect, useState } from "react";
import { Loader2, Send } from "lucide-react";

type Campaign = { _id: string; subject: string; previewText?: string; content: string; status: "draft" | "sent"; recipientCount: number; createdAt: string; sentAt?: string };

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [recipients, setRecipients] = useState(0);
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/marketing");
    if (!res.ok) return;
    const data = await res.json();
    setCampaigns(data.campaigns);
    setRecipients(data.recipients);
  }
  useEffect(() => { void load(); }, []);

  async function saveDraft(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMessage(null);
    const res = await fetch("/api/admin/marketing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject, previewText, content }) });
    const data = await res.json(); setSaving(false);
    if (!res.ok) { setMessage(data.error || "Could not save the draft."); return; }
    setCampaigns((all) => [data.campaign, ...all]); setSubject(""); setPreviewText(""); setContent(""); setMessage("Draft saved. Review it, then send when ready.");
  }

  async function send(id: string) {
    setSaving(true); setMessage(null);
    const res = await fetch("/api/admin/marketing", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const data = await res.json(); setSaving(false);
    if (!res.ok) { setMessage(data.error || "Could not send the campaign."); return; }
    setCampaigns((all) => all.map((c) => c._id === id ? data.campaign : c)); setMessage(`Campaign sent to ${data.sent} opted-in customer${data.sent === 1 ? "" : "s"}.`);
  }

  const input = "w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-stone-900";
  return <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
    <h1 className="text-2xl font-semibold tracking-tight text-stone-900">Email campaigns</h1>
    <p className="mt-1 text-sm text-stone-500">Write to customers who have chosen to receive your updates. {recipients} opted-in recipient{recipients === 1 ? "" : "s"}.</p>
    <form onSubmit={saveDraft} className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
      <h2 className="font-semibold text-stone-900">New campaign</h2>
      <div className="mt-4 space-y-4">
        <input required value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={160} placeholder="Email subject" className={input} />
        <input value={previewText} onChange={(e) => setPreviewText(e.target.value)} maxLength={240} placeholder="Preview text, optional" className={input} />
        <textarea required rows={8} value={content} onChange={(e) => setContent(e.target.value)} maxLength={20000} placeholder="Write your update here..." className={input} />
      </div>
      {message ? <p className="mt-4 rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-700">{message}</p> : null}
      <button disabled={saving} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save draft</button>
    </form>
    <section className="mt-8"><h2 className="font-semibold text-stone-900">Campaign history</h2><div className="mt-3 space-y-3">
      {campaigns.length ? campaigns.map((campaign) => <article key={campaign._id} className="rounded-2xl border border-stone-200 bg-white p-4 sm:flex sm:items-center sm:justify-between sm:gap-4"><div><p className="font-medium text-stone-900">{campaign.subject}</p><p className="mt-1 text-sm text-stone-500">{campaign.status === "sent" ? `Sent to ${campaign.recipientCount} customers` : "Draft"} · {new Date(campaign.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}</p></div>{campaign.status === "draft" ? <button disabled={saving || recipients === 0} onClick={() => void send(campaign._id)} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-50 sm:mt-0"><Send className="h-4 w-4" /> Send campaign</button> : null}</article>) : <p className="rounded-2xl border border-dashed border-stone-300 px-4 py-10 text-center text-sm text-stone-500">Your saved campaigns will appear here.</p>}
    </div></section>
  </div>;
}
