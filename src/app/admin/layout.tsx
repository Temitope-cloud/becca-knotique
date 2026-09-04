import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { ConfirmProvider } from "@/components/ui/confirm";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <ConfirmProvider>
      <div className="flex min-h-dvh flex-col bg-stone-50 lg:flex-row">
        <AdminSidebar name={session.user.name} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </ConfirmProvider>
  );
}
