"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { AlertDialog } from "radix-ui";

export interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  /** Style the confirm button as a destructive (red) action. */
  destructive?: boolean;
}

type ConfirmFn = (options?: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * Promise-based confirm dialog, a drop-in replacement for window.confirm():
 *   const confirm = useConfirm();
 *   if (!(await confirm({ description: "Delete this?" }))) return;
 */
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  // Fall back to the native dialog if used outside a provider.
  return (
    ctx ??
    (async (options?: ConfirmOptions) =>
      typeof window !== "undefined" &&
      window.confirm(options?.description ?? "Are you sure?"))
  );
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts ?? {});
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = useCallback((value: boolean) => {
    setOpen(false);
    resolver.current?.(value);
    resolver.current = null;
  }, []);

  const {
    title = "Are you sure?",
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    destructive = false,
  } = options;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog.Root
        open={open}
        onOpenChange={(next) => {
          // Closing via Escape or the overlay counts as a cancel.
          if (!next) settle(false);
        }}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="bk-confirm-overlay fixed inset-0 z-[300] bg-black/50" />
          <AlertDialog.Content className="bk-confirm-content fixed top-1/2 left-1/2 z-[301] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-stone-200 bg-white p-6 shadow-xl outline-none">
            <AlertDialog.Title className="text-lg font-semibold text-stone-900">
              {title}
            </AlertDialog.Title>
            {description ? (
              <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-stone-600">
                {description}
              </AlertDialog.Description>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <AlertDialog.Cancel asChild>
                <button
                  type="button"
                  onClick={() => settle(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                >
                  {cancelText}
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  type="button"
                  onClick={() => settle(true)}
                  className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${
                    destructive
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-stone-900 hover:bg-stone-800"
                  }`}
                >
                  {confirmText}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      <style>{`
        /* Centering uses Tailwind's translate utilities (the CSS 'translate'
           property), so animate opacity + the standalone 'scale' property here —
           animating 'transform' would fight the centering and slide the box. */
        @keyframes bk-confirm-overlay-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bk-confirm-content-in {
          from { opacity: 0; scale: 0.96; }
          to { opacity: 1; scale: 1; }
        }
        .bk-confirm-overlay[data-state="open"] { animation: bk-confirm-overlay-in 0.15s ease-out; }
        .bk-confirm-content[data-state="open"] { animation: bk-confirm-content-in 0.18s ease-out; }
      `}</style>
    </ConfirmContext.Provider>
  );
}
