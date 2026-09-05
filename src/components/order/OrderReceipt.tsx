import { formatNaira } from "@/lib/money";
import type { IOrder } from "@/lib/models/Order";
import PrintReceiptButton from "./PrintReceiptButton";

/** Deterministic barcode bar widths derived from the order reference. */
function barcodeBars(seed: string): number[] {
  const s = seed || "BK";
  const bars: number[] = [];
  for (let i = 0; i < 58; i++) {
    const code = s.charCodeAt(i % s.length) + i * 13;
    bars.push(1 + (code % 3)); // width unit 1..3
  }
  return bars;
}

function formatDateTime(value?: Date | string | null): string {
  if (!value) return "";
  const d = new Date(value);
  const date = d.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${date} • ${time}`;
}

export default function OrderReceipt({ order }: { order: IOrder }) {
  const number = order.orderNumber ?? order.reference;
  const bars = barcodeBars(order.reference || number);

  // Best-effort card details from the Paystack payload.
  const pay = order.paystack as
    | { channel?: string; authorization?: { last4?: string; brand?: string; card_type?: string } }
    | undefined;
  const last4 = pay?.authorization?.last4;
  const brand = pay?.authorization?.brand || pay?.authorization?.card_type;
  const channel = pay?.channel;
  const methodLabel = last4
    ? `${brand ? brand.replace(/_/g, " ") : "Card"} •••• ${last4}`
    : channel
      ? `Paystack · ${channel.replace(/_/g, " ")}`
      : "Paid with Paystack";

  return (
    <div className="w-full">
      <div id="bk-receipt" className="bk-receipt mx-auto w-full max-w-sm">
        {/* top stub */}
        <div className="rounded-t-2xl bg-white px-7 pt-8 pb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-2xl">
            🎉
          </div>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-stone-900">
            Thank you!
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Your order has been confirmed
          </p>
        </div>

        {/* tear line with side notches */}
        <div className="bk-receipt-tear" aria-hidden>
          <span className="bk-notch bk-notch-l" />
          <span className="bk-notch bk-notch-r" />
        </div>

        {/* body */}
        <div className="bg-white px-7 pt-6 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium tracking-[0.16em] text-stone-400 uppercase">
                Order ID
              </p>
              <p className="mt-1 font-mono text-sm font-semibold text-stone-900">
                {number}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-medium tracking-[0.16em] text-stone-400 uppercase">
                Amount
              </p>
              <p className="mt-1 font-mono text-sm font-semibold text-stone-900">
                {formatNaira(order.amount)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium tracking-[0.16em] text-stone-400 uppercase">
                Date & Time
              </p>
              <p className="mt-1 text-sm text-stone-800">
                {formatDateTime(order.paidAt ?? order.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-medium tracking-[0.16em] text-stone-400 uppercase">
                Customer
              </p>
              <p className="mt-1 text-sm text-stone-800">{order.customer?.name}</p>
            </div>
          </div>

          {/* itemised list */}
          <div className="mt-6 border-t border-dashed border-stone-200 pt-4">
            <ul className="space-y-2.5">
              {order.items.map((item, i) => (
                <li key={i} className="flex items-start justify-between gap-3 text-sm">
                  <span className="min-w-0 text-stone-700">
                    <span className="font-mono text-stone-400">
                      {item.quantity}×
                    </span>{" "}
                    {item.name}
                    {item.size ? (
                      <span className="text-stone-400"> · {item.size}</span>
                    ) : null}
                  </span>
                  <span className="shrink-0 font-mono text-stone-900">
                    {formatNaira(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* totals */}
          <div className="mt-4 space-y-1.5 border-t border-dashed border-stone-200 pt-4 text-sm">
            <div className="flex justify-between text-stone-500">
              <span>Subtotal</span>
              <span className="font-mono">{formatNaira(order.subtotal)}</span>
            </div>
            {order.discount > 0 ? (
              <div className="flex justify-between text-emerald-700">
                <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                <span className="font-mono">-{formatNaira(order.discount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-stone-500">
              <span>Shipping</span>
              <span className="font-mono">
                {order.shippingFee > 0 ? formatNaira(order.shippingFee) : "Free"}
              </span>
            </div>
            <div className="flex justify-between border-t border-stone-100 pt-2 text-base font-semibold text-stone-900">
              <span>Total</span>
              <span className="font-mono">{formatNaira(order.amount)}</span>
            </div>
          </div>

          {/* payment method chip */}
          <div className="mt-5 flex items-center gap-3 rounded-xl bg-stone-50 px-3.5 py-3">
            <span className="flex h-7 w-10 items-center justify-center rounded-md bg-white shadow-sm">
              <span className="block h-3.5 w-3.5 rounded-full bg-rose-500/80" />
              <span className="-ml-1.5 block h-3.5 w-3.5 rounded-full bg-amber-400/80" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-stone-800 capitalize">
                {methodLabel}
              </p>
              <p className="text-xs text-emerald-600">Payment successful</p>
            </div>
          </div>
        </div>

        {/* barcode footer with scalloped bottom */}
        <div className="bk-receipt-foot bg-white px-7 pt-2 pb-8">
          <div className="flex h-14 items-end justify-center gap-[2px]">
            {bars.map((w, i) => (
              <span
                key={i}
                className={i % 2 === 0 ? "bg-stone-900" : "bg-transparent"}
                style={{ width: `${w}px`, height: "100%" }}
              />
            ))}
          </div>
          <p className="mt-2 text-center font-mono text-[11px] tracking-[0.35em] text-stone-500">
            {number}
          </p>
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-sm flex-wrap items-center justify-center gap-2 print:hidden">
        <PrintReceiptButton />
      </div>

      <style>{`
        .bk-receipt {
          filter: drop-shadow(0 20px 45px rgba(0,0,0,0.08));
        }
        /* dashed tear line with a notch bitten out of each side */
        .bk-receipt-tear {
          position: relative;
          height: 22px;
          background: #fff;
        }
        .bk-receipt-tear::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 14px;
          right: 14px;
          transform: translateY(-50%);
          border-top: 2px dashed #e7e5e4;
        }
        .bk-notch {
          position: absolute;
          top: 50%;
          width: 22px;
          height: 22px;
          transform: translateY(-50%);
          border-radius: 9999px;
          background: var(--bk-receipt-bg, #f5f5f4);
        }
        .bk-notch-l { left: -11px; }
        .bk-notch-r { right: -11px; }
        /* scalloped bottom edge */
        .bk-receipt-foot {
          -webkit-mask:
            radial-gradient(circle 8px at 12px 100%, transparent 98%, #000) repeat-x;
          mask:
            radial-gradient(circle 8px at 12px 100%, transparent 98%, #000) repeat-x;
          -webkit-mask-size: 24px 16px;
          mask-size: 24px 16px;
          padding-bottom: 26px;
        }
        @media print {
          body * { visibility: hidden !important; }
          #bk-receipt, #bk-receipt * { visibility: visible !important; }
          #bk-receipt { position: absolute; left: 50%; top: 0; transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
