"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, Send, Users } from "lucide-react";
import RichTextEditor from "@/components/admin/RichTextEditor";

type Audience = "all_opted_in" | "newsletter" | "customers";
type Campaign = { _id: string; subject: string; previewText?: string; content: string; audience?: Audience; status: "draft" | "sent"; recipientCount: number; createdAt: string };
type Customer = { name?: string; email: string; joinedAt: string; marketingOptIn: boolean };
type Newsletter = { email: string; joinedAt: string };

function isCustomer(contact: Customer | Newsletter): contact is Customer {
  return "marketingOptIn" in contact;
}

const audienceLabels: Record<Audience, string> = {
  all_opted_in: "All opted-in contacts",
  newsletter: "Newsletter-only subscribers",
  customers: "Registered customers who opted in",
};

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [audiences, setAudiences] = useState({ allOptedIn: 0, newsletter: 0, customers: 0, optedInCustomers: 0 });
  const [contacts, setContacts] = useState<{ newsletter: Newsletter[]; customers: Customer[] }>({ newsletter: [], customers: [] });
  const [audience, setAudience] = useState<Audience>("all_opted_in");
  const [view, setView] = useState<"newsletter" | "customers">("newsletter");
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const response = await fetch("/api/admin/marketing");
    if (!response.ok) return;
    const data = await response.json();
    setCampaigns(data.campaigns ?? []);
    setAudiences(data.audiences);
    setContacts(data.contacts);
  }
  useEffect(() => { void load(); }, []);

  async function saveDraft(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setMessage(null);
    const response = await fetch("/api/admin/marketing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject, previewText, content, audience }) });
    const data = await response.json(); setSaving(false);
    if (!response.ok) { setMessage(data.error || "Could not save the draft."); return; }
    setCampaigns((all) => [data.campaign, ...all]); setSubject(""); setPreviewText(""); setContent(""); setMessage("Draft saved. Send it when you are ready.");
  }

  async function send(id: string) {
    setSaving(true); setMessage(null);
    const response = await fetch("/api/admin/marketing", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const data = await response.json(); setSaving(false);
    if (!response.ok) { setMessage(data.error || "Could not send the campaign."); return; }
    setCampaigns((all) => all.map((campaign) => campaign._id === id ? data.campaign : campaign)); setMessage(`Campaign sent to ${data.sent} recipient${data.sent === 1 ? "" : "s"}.`);
  }

  const input = "w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-stone-900";
  const selectedCount = audience === "all_opted_in" ? audiences.allOptedIn : audience === "newsletter" ? audiences.newsletter : audiences.optedInCustomers;
  const list = view === "newsletter" ? contacts.newsletter : contacts.customers;

  return <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
    <h1 className="text-2xl font-semibold tracking-tight text-stone-900">Email marketing</h1>
    <p className="mt-1 text-sm text-stone-500">Create, save, and send campaigns to the people who have agreed to hear from your store.</p>

    <section className="mt-6 grid gap-3 sm:grid-cols-3">
      {[
        { title: "Campaign-ready", value: audiences.allOptedIn, note: "All consented contacts" },
        { title: "Newsletter only", value: audiences.newsletter, note: "Joined from the pop-up" },
        { title: "Registered customers", value: audiences.customers, note: `${audiences.optedInCustomers} opted in to marketing` },
      ].map((card) => <div key={card.title} className="rounded-2xl border border-stone-200 bg-white p-4"><p className="text-sm text-stone-500">{card.title}</p><p className="mt-2 text-3xl font-semibold text-stone-900">{card.value}</p><p className="mt-1 text-xs text-stone-400">{card.note}</p></div>)}
    </section>

    <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <form onSubmit={saveDraft} className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-2"><Mail className="size-5" /><h2 className="font-semibold text-stone-900">Create campaign</h2></div>
        <div className="mt-4 space-y-4">
          <div><label className="mb-1.5 block text-sm font-medium text-stone-700">Send to</label><select value={audience} onChange={(event) => setAudience(event.target.value as Audience)} className={input}>{(Object.keys(audienceLabels) as Audience[]).map((key) => <option key={key} value={key}>{audienceLabels[key]}</option>)}</select><p className="mt-1.5 text-xs text-stone-500">This campaign will go to {selectedCount} eligible recipient{selectedCount === 1 ? "" : "s"}.</p></div>
          <input required value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={160} placeholder="Email subject" className={input} />
          <input value={previewText} onChange={(event) => setPreviewText(event.target.value)} maxLength={240} placeholder="Preview text, optional" className={input} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">Email message</label>
            <RichTextEditor value={content} onChange={setContent} />
            <p className="mt-1.5 text-xs text-stone-500">Use the toolbar for headings, links, lists, images, and emphasis.</p>
          </div>
        </div>
        {message ? <p className="mt-4 rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-700">{message}</p> : null}
        <button disabled={saving} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? <Loader2 className="size-4 animate-spin" /> : null} Save draft</button>
      </form>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6"><div className="flex items-center gap-2"><Users className="size-5" /><h2 className="font-semibold text-stone-900">Your contacts</h2></div><div className="mt-4 flex gap-2"><button type="button" onClick={() => setView("newsletter")} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${view === "newsletter" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600"}`}>Newsletter only</button><button type="button" onClick={() => setView("customers")} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${view === "customers" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600"}`}>Registered customers</button></div><div className="mt-4 max-h-[335px] divide-y divide-stone-100 overflow-y-auto">{list.length ? list.map((contact) => <div key={contact.email} className="py-3"><p className="text-sm font-medium text-stone-900">{isCustomer(contact) && contact.name ? contact.name : contact.email}</p><p className="text-xs text-stone-500">{isCustomer(contact) && contact.name ? contact.email : "Newsletter subscriber"}</p>{isCustomer(contact) ? <p className={`mt-1 text-xs font-medium ${contact.marketingOptIn ? "text-emerald-700" : "text-stone-400"}`}>{contact.marketingOptIn ? "Marketing opted in" : "Not opted in"}</p> : null}</div>) : <p className="py-10 text-center text-sm text-stone-500">No contacts in this group yet.</p>}</div></section>
    </div>

    <section className="mt-8"><h2 className="font-semibold text-stone-900">Campaign history</h2><div className="mt-3 space-y-3">{campaigns.length ? campaigns.map((campaign) => <article key={campaign._id} className="rounded-2xl border border-stone-200 bg-white p-4 sm:flex sm:items-center sm:justify-between sm:gap-4"><div><p className="font-medium text-stone-900">{campaign.subject}</p><p className="mt-1 text-sm text-stone-500">{campaign.status === "sent" ? `Sent to ${campaign.recipientCount} people` : "Draft"} · {audienceLabels[campaign.audience ?? "all_opted_in"]}</p></div>{campaign.status === "draft" ? <button disabled={saving} onClick={() => void send(campaign._id)} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-50 sm:mt-0"><Send className="size-4" /> Send campaign</button> : null}</article>) : <p className="rounded-2xl border border-dashed border-stone-300 px-4 py-10 text-center text-sm text-stone-500">Your saved campaigns will appear here.</p>}</div></section>
  </div>;
}
