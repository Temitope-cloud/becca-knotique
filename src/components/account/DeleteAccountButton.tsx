"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Loader2, Trash2 } from "lucide-react";
import { useConfirm } from "@/components/ui/confirm";
import { formatNaira } from "@/lib/money";

export default function DeleteAccountButton({
  storeCredit = 0,
  pendingRefunds = 0,
}: {
  storeCredit?: number;
  pendingRefunds?: number;
}) {
  const confirm = useConfirm();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const warnings: string[] = [
      "This permanently deletes your account and sign-in.",
    ];
    if (storeCredit > 0) {
      warnings.push(
        `You will lose your store credit of ${formatNaira(storeCredit)}.`,
      );
    }
    if (pendingRefunds > 0) {
      warnings.push("You have a refund request still under review.");
    }
    warnings.push("This cannot be undone.");

    const ok = await confirm({
      title: "Delete your account?",
      description: warnings.join(" "),
      confirmText: "Delete my account",
      cancelText: "Keep my account",
      destructive: true,
    });
    if (!ok) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Could not delete your account.");
        setBusy(false);
        return;
      }
      await signOut({ callbackUrl: "/" });
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-xl border border-rose-300 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        Delete my account
      </button>
      {error ? (
        <p className="mt-2 text-sm text-rose-700">{error}</p>
      ) : null}
    </div>
  );
}
