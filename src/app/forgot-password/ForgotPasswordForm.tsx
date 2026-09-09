"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Ignore — we always show the same confirmation either way.
    } finally {
      setLoading(false);
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <MailCheck className="h-6 w-6" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          If an account exists for <span className="font-medium">{email}</span>,
          we&apos;ve sent a link to reset your password. It expires in 1 hour.
        </p>
        <p className="mt-2 text-xs text-stone-500">
          Check your spam folder if you don&apos;t see it in a few minutes.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-xl bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Send reset link
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-600">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-semibold text-stone-900 underline underline-offset-4"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
