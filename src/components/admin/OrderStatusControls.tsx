"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, Package, Cog, Truck, Home } from "lucide-react";

const paymentOptions = [
  { value: "pending", label: "Pending", active: "bg-amber-500 text-white", ring: "ring-amber-200" },
  { value: "paid", label: "Paid", active: "bg-emerald-600 text-white", ring: "ring-emerald-200" },
  { value: "failed", label: "Failed", active: "bg-rose-600 text-white", ring: "ring-rose-200" },
  { value: "cancelled", label: "Cancelled", active: "bg-stone-700 text-white", ring: "ring-stone-200" },
];

const fulfillmentSteps = [
  { value: "unfulfilled", label: "Unfulfilled", Icon: Package },
  { value: "processing", label: "Processing", Icon: Cog },
  { value: "shipped", label: "Shipped", Icon: Truck },
  { value: "delivered", label: "Delivered", Icon: Home },
];

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
  const [saved, setSaved] = useState(false);

  async function update(field: "status" | "fulfillmentStatus", value: string) {
    if (
      (field === "status" && value === status) ||
      (field === "fulfillmentStatus" && value === fulfillmentStatus)
    )
      return;
    setSaving(`${field}:${value}`);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/orders/${reference}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        setSaved(true);
        window.setTimeout(() => setSaved(false), 1800);
        router.refresh();
      }
    } finally {
      setSaving(null);
    }
  }

  const currentStep = fulfillmentSteps.findIndex(
    (s) => s.value === fulfillmentStatus,
  );

  return (
    <div className="space-y-6">
      {/* payment status */}
      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-stone-500 uppercase">
          Payment status
        </p>
        <div className="grid grid-cols-2 gap-2">
          {paymentOptions.map((o) => {
            const isActive = o.value === status;
            const isSaving = saving === `status:${o.value}`;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => update("status", o.value)}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? `${o.active} shadow-sm`
                    : "border border-stone-300 bg-white text-stone-600 hover:border-stone-400"
                }`}
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : isActive ? (
                  <Check className="h-3.5 w-3.5" />
                ) : null}
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* fulfillment stepper */}
      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-stone-500 uppercase">
          Fulfillment
        </p>
        <div className="space-y-1.5">
          {fulfillmentSteps.map((s, i) => {
            const done = i < currentStep;
            const active = i === currentStep;
            const isSaving = saving === `fulfillmentStatus:${s.value}`;
            const Icon = s.Icon;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => update("fulfillmentStatus", s.value)}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                    : done
                      ? "border-emerald-200 bg-white text-stone-600"
                      : "border-stone-200 bg-white text-stone-500 hover:border-stone-300"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    done || active
                      ? "bg-emerald-600 text-white"
                      : "bg-stone-100 text-stone-400"
                  }`}
                >
                  {isSaving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : done ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                </span>
                {s.label}
                {active ? (
                  <span className="ml-auto text-xs font-semibold text-emerald-700">
                    Current
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {saved ? (
        <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
          <Check className="h-3.5 w-3.5" /> Saved
        </p>
      ) : null}
    </div>
  );
}
