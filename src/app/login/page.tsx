import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Becca's Knotique account.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-md flex-col justify-center px-4 py-16">
      <Link
        href="/"
        className="mb-8 text-center text-sm font-medium tracking-[0.2em] text-stone-500 uppercase"
      >
        Becca&apos;s Knotique
      </Link>
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Welcome back
        </h1>
        <p className="mt-1 mb-6 text-sm text-stone-600">
          Sign in to track your orders and check out faster.
        </p>
        <Suspense fallback={<div className="h-64" />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
