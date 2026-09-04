import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { listReleases } from "@/lib/releases";
import ReleaseManager from "@/components/admin/ReleaseManager";

export const metadata: Metadata = {
  title: "Release log",
  robots: { index: false, follow: false },
};

// Always read the latest entries from the database.
export const dynamic = "force-dynamic";

export default async function ReleaseLogPage() {
  await requireAdmin();
  const releases = await listReleases();

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Release log
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          A running list of what we have shipped on Becca&apos;s Knotique, newest
          first. Add, edit, or remove entries here — only you can see this page.
        </p>
      </div>

      <ReleaseManager releases={releases} />
    </div>
  );
}
