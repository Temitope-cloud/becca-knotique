"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, Check } from "lucide-react";

export default function SyncOrdersButton() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");

  async function sync() {
    setState("busy");
    try {
      const res = await fetch("/api/admin/finance/backfill", {
        method: "POST",
      });
      if (res.ok) {
        setState("done");
        router.refresh();
        window.setTimeout(() => setState("idle"), 2500);
      } else {
        setState("idle");
      }
    } catch {
      setState("idle");
    }
  }

  return (
    <button
      type="button"
      onClick={sync}
      disabled={state === "busy"}
      title="Import any paid orders that aren't in the ledger yet"
      className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-1.5 text-sm font-medium text-stone-600 transition hover:border-stone-400 disabled:opacity-60"
    >
      {state === "busy" ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : state === "done" ? (
        <Check className="h-4 w-4 text-emerald-600" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      {state === "done" ? "Synced" : "Sync past orders"}
    </button>
  );
}
