"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";

export default function TwoFactorSettings() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [mode, setMode] = useState<"enable" | "disable" | null>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/account/two-factor")
      .then((r) => r.json())
      .then((data) => setEnabled(Boolean(data.enabled)))
      .catch(() => setMessage("Could not load your security settings."));
  }, []);

  async function requestCode(nextMode: "enable" | "disable") {
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/account/two-factor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: nextMode === "enable" ? "request_enable" : "request_disable" }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not send a code.");
      setMode(nextMode); setCode(""); setMessage("A six-digit code was sent to your email.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not send a code.");
    } finally { setSaving(false); }
  }

  async function confirm(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/account/two-factor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: mode === "enable" ? "confirm_enable" : "confirm_disable", code }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "That code could not be verified.");
      setEnabled(Boolean(data.enabled)); setMode(null); setCode("");
      setMessage(data.enabled ? "Two-step verification is on." : "Two-step verification is off.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "That code could not be verified.");
    } finally { setSaving(false); }
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><ShieldCheck className="h-5 w-5" /></span><div><h2 className="font-semibold text-stone-900">Two-step verification</h2><p className="mt-1 text-sm leading-relaxed text-stone-600">For password sign-ins, we&apos;ll send a six-digit code to your email after your password is accepted.</p></div></div>
      <p className="mt-4 text-sm font-medium text-stone-700">Status: {enabled === null ? "Loading…" : enabled ? "Enabled" : "Not enabled"}</p>
      {mode ? <form onSubmit={confirm} className="mt-4 max-w-sm space-y-3"><input required inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Six-digit code" className="w-full rounded-xl border border-stone-300 px-4 py-3 tracking-[0.3em] outline-none focus:border-stone-900" /><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? <Loader2 className="size-4 animate-spin" /> : null} Confirm</button></form> : <button type="button" disabled={saving || enabled === null} onClick={() => void requestCode(enabled ? "disable" : "enable")} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? <Loader2 className="size-4 animate-spin" /> : null}{enabled ? "Turn off two-step verification" : "Turn on two-step verification"}</button>}
      {message ? <p className="mt-3 text-sm text-stone-600">{message}</p> : null}
      <p className="mt-4 text-xs leading-relaxed text-stone-500">Google sign-in uses Google&apos;s own account verification.</p>
    </section>
  );
}
