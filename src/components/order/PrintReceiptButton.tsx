"use client";

import { Printer } from "lucide-react";

export default function PrintReceiptButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
    >
      <Printer className="h-4 w-4" />
      Print or save receipt
    </button>
  );
}
