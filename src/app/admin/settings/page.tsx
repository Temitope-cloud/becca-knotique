import { requireAdmin } from "@/lib/admin-auth";
import { getSettings } from "@/lib/settings";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getSettings();

  return (
    <div className="px-5 py-8 sm:px-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-stone-900">
        Settings
      </h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
