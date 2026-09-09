"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const missingLink = !token || !email;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Could not reset your password.");
        setLoading(false);
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 2200);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (missingLink) {
    return (
      <div className="text-center">
        <p className="text-sm leading-relaxed text-stone-700">
          This reset link is incomplete or invalid. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-flex rounded-xl bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          Your password has been updated. Taking you to sign in...
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-xl bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          Sign in now
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-stone-700"
        >
          New password
        </label>
        <div className="relative">
          <input
            id="password"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 pr-11 text-stone-900 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-stone-400 transition hover:text-stone-700"
          >
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="confirm"
          className="mb-1.5 block text-sm font-medium text-stone-700"
        >
          Confirm new password
        </label>
        <input
          id="confirm"
          type={show ? "text" : "password"}
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
        />
      </div>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Update password
      </button>
    </form>
  );
}
