import type { Metadata } from "next";
import Link from "next/link";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your Becca's Knotique password.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
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
          Forgot your password?
        </h1>
        <p className="mt-1 mb-6 text-sm text-stone-600">
          Enter your email and we&apos;ll send you a link to set a new one.
        </p>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
