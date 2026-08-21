import { Check } from "lucide-react";

const STEPS = ["Cart", "Details", "Payment"];

/** Shared checkout progress indicator. `current` is the active step index. */
export default function CheckoutSteps({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 text-xs font-medium sm:gap-3">
      {STEPS.map((s, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <div key={s} className="flex items-center gap-2 sm:gap-3">
            <span
              className={`flex items-center gap-1.5 ${
                active
                  ? "text-stone-900"
                  : done
                    ? "text-stone-500"
                    : "text-stone-300"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                  active
                    ? "bg-stone-900 text-white"
                    : done
                      ? "bg-stone-200 text-stone-600"
                      : "border border-stone-300"
                }`}
              >
                {done ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              {s}
            </span>
            {i < STEPS.length - 1 ? (
              <span className="h-px w-6 bg-stone-200 sm:w-10" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
