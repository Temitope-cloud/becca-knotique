"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { useConfirm } from "@/components/ui/confirm";

export default function DeleteTxnButton({ id }: { id: string }) {
  const router = useRouter();
  const confirm = useConfirm();
  const [busy, setBusy] = useState(false);

  async function remove() {
    const ok = await confirm({
      title: "Delete ledger entry",
      description: "This permanently deletes the ledger entry. This cannot be undone.",
      confirmText: "Delete",
      destructive: true,
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/finance/transactions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) router.refresh();
      else setBusy(false);
    } catch {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={busy}
      aria-label="Delete entry"
      className="rounded-md p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-rose-600 disabled:opacity-50"
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
}
