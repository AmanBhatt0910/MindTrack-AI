"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProfileTab from "@/features/settings/components/ProfileTab";
import NotificationsTab from "@/features/settings/components/NotificationsTab";
import ApiTab from "@/features/settings/components/ApiTab";
import DangerTab from "@/features/settings/components/DangerTab";
import { type SettingsTabId, SETTINGS_TABS } from "@/constants/dashboard";

const TAB_CONTENT: Record<SettingsTabId, React.ReactNode> = {
  profile: <ProfileTab />,
  notifications: <NotificationsTab />,
  api: <ApiTab />,
  danger: <DangerTab />,
};

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab") as SettingsTabId | null;
  const activeTab: SettingsTabId =
    tabParam && SETTINGS_TABS.some((t) => t.id === tabParam) ? tabParam : "profile";

  useEffect(() => {
    if (!tabParam) {
      router.replace("/settings?tab=profile", { scroll: false });
    }
  }, [tabParam, router]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex-1 min-w-0">{TAB_CONTENT[activeTab]}</div>
    </div>
  );
}

export default function SettingsPage() {
  const user = useRequireAuth();
  if (!user) return null;

  return (
    <DashboardLayout
      title="Settings"
      subtitle="Manage your account, notifications, and API access"
    >
      <Suspense fallback={<div className="max-w-4xl mx-auto">Loading settings...</div>}>
        <SettingsContent />
      </Suspense>
    </DashboardLayout>
  );
}