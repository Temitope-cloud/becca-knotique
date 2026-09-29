"use client";

import { KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";

export default function PasswordSettings({ hasPassword, provider }: { hasPassword: boolean; provider: "google" | "credentials" }) {
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8) { setMessage("Use at least 8 characters for your password."); return; }
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/account/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password, currentPassword: hasPassword ? currentPassword : undefined }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not save your password.");
      setPassword(""); setCurrentPassword(""); setMessage(hasPassword ? "Your password has been updated." : "Password linked. You can now sign in with Google or email and password.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save your password."); }
    finally { setSaving(false); }
  }

  return <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6"><div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><KeyRound className="h-5 w-5" /></span><div><h2 className="font-semibold text-stone-900">Sign-in methods</h2><p className="mt-1 text-sm leading-relaxed text-stone-600">{hasPassword ? "You can sign in with your email and password." : "You currently sign in with Google. Add a password to use either sign-in method."}</p></div></div><p className="mt-4 text-xs text-stone-500">Google sign-in: {provider === "google" ? "Connected" : "Available with this email"}</p><form onSubmit={submit} className="mt-4 max-w-md space-y-3">{hasPassword ? <input required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} type="password" autoComplete="current-password" placeholder="Current password" className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-900" /> : null}<input required value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="new-password" placeholder={hasPassword ? "New password" : "Create a password"} className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-900" /><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? <Loader2 className="size-4 animate-spin" /> : null}{hasPassword ? "Update password" : "Add password"}</button></form>{message ? <p className="mt-3 text-sm text-stone-600">{message}</p> : null}</section>;
}
