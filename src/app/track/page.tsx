import { Suspense } from "react";
import type { Metadata } from "next";
import TrackClient from "./TrackClient";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Check the status of your Becca's Knotique order.",
};

export default function TrackPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          Track your order
        </h1>
        <p className="mt-2 text-stone-600">
          Enter your order number and email to follow it from placed to
          delivered.
        </p>
      </div>
      <Suspense fallback={<div className="h-64" />}>
        <TrackClient />
      </Suspense>
    </main>
  );
}
