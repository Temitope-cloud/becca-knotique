import {
  Check,
  ClipboardList,
  CreditCard,
  Package,
  Truck,
  Home,
  XCircle,
  Clock,
} from "lucide-react";

export interface TimelineOrder {
  status: string; // pending | paid | failed | cancelled
  fulfillmentStatus: string; // unfulfilled | processing | shipped | delivered
  placedAt: string | Date;
  paidAt?: string | Date | null;
}

function fmt(d?: string | Date | null): string {
  if (!d) return "";
  return new Date(d).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function OrderTimeline({ order }: { order: TimelineOrder }) {
  const { status, fulfillmentStatus: f } = order;

  if (status === "cancelled" || status === "failed") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5">
        <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-rose-500" />
        <div>
          <p className="font-semibold text-rose-900">
            {status === "cancelled" ? "Order cancelled" : "Payment not completed"}
          </p>
          <p className="mt-1 text-sm text-rose-700">
            {status === "cancelled"
              ? "This order was cancelled. If this is a mistake, please contact us."
              : "We couldn't confirm payment for this order. You can try ordering again or reach out for help."}
          </p>
        </div>
      </div>
    );
  }

  const paid = status === "paid";
  const steps = [
    {
      label: "Order placed",
      desc: "We received your order",
      icon: ClipboardList,
      done: true,
      at: order.placedAt,
    },
    {
      label: paid ? "Payment confirmed" : "Awaiting payment",
      desc: paid ? "Your payment went through" : "Complete payment to proceed",
      icon: CreditCard,
      done: paid,
      at: order.paidAt,
    },
    {
      label: "Processing",
      desc: "We're preparing your piece",
      icon: Package,
      done: paid && ["processing", "shipped", "delivered"].includes(f),
    },
    {
      label: "Shipped",
      desc: "On its way to you",
      icon: Truck,
      done: paid && ["shipped", "delivered"].includes(f),
    },
    {
      label: "Delivered",
      desc: "Enjoy! 🧶",
      icon: Home,
      done: paid && f === "delivered",
    },
  ];

  const currentIndex = steps.findIndex((s) => !s.done);

  return (
    <ol className="relative">
      {steps.map((step, i) => {
        const isCurrent = i === currentIndex;
        const isLast = i === steps.length - 1;
        const Icon = step.done ? Check : isCurrent ? Clock : step.icon;
        return (
          <li key={step.label} className="relative flex gap-4 pb-8 last:pb-0">
            {/* connector */}
            {!isLast ? (
              <span
                aria-hidden
                className={`absolute top-9 left-[17px] h-[calc(100%-1.5rem)] w-0.5 ${
                  step.done ? "bg-stone-900" : "bg-stone-200"
                }`}
              />
            ) : null}

            {/* node */}
            <span
              className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition ${
                step.done
                  ? "border-stone-900 bg-stone-900 text-white"
                  : isCurrent
                    ? "border-[#059669] bg-[#059669]/15 text-[#047857]"
                    : "border-stone-200 bg-white text-stone-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              {isCurrent ? (
                <span className="absolute inset-0 animate-ping rounded-full border-2 border-[#059669]/50" />
              ) : null}
            </span>

            {/* text */}
            <div className="pt-1">
              <p
                className={`text-sm font-semibold ${
                  step.done || isCurrent ? "text-stone-900" : "text-stone-400"
                }`}
              >
                {step.label}
              </p>
              <p className="text-xs text-stone-500">{step.desc}</p>
              {step.at ? (
                <p className="mt-0.5 text-xs text-stone-400">{fmt(step.at)}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
