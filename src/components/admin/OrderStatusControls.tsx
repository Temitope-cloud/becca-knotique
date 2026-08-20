"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const paymentOptions = ["pending", "paid", "failed", "cancelled"];
const fulfillmentOptions = ["unfulfilled", "processing", "shipped", "delivered"];

export default function OrderStatusControls({
  reference,
  status,
  fulfillmentStatus,
}: {
  reference: string;
  status: string;
  fulfillmentStatus: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState<string | null>(null);

  async function update(field: "status" | "fulfillmentStatus", value: string) {
    setSaving(field);
    try {
      const res = await fetch(`/api/admin/orders/${reference}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) router.refresh();
    } finally {
      setSaving(null);
    }
  }

  const selectClass =
    "w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-stone-900";

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold tracking-wide text-stone-500 uppercase">
          Payment status
          {saving === "status" ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : null}
        </label>
        <select
          value={status}
          onChange={(e) => update("status", e.target.value)}
          className={selectClass}
        >
          {paymentOptions.map((o) => (
            <option key={o} value={o} className="capitalize">
              {o}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold tracking-wide text-stone-500 uppercase">
          Fulfillment
          {saving === "fulfillmentStatus" ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : null}
        </label>
        <select
          value={fulfillmentStatus}
          onChange={(e) => update("fulfillmentStatus", e.target.value)}
          className={selectClass}
        >
          {fulfillmentOptions.map((o) => (
            <option key={o} value={o} className="capitalize">
              {o}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
