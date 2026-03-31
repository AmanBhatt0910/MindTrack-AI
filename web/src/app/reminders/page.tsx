"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import DashboardLayout from "@/layouts/DashboardLayout";
import ReminderManager from "@/features/reminders/components/ReminderManager";
import { useTranslation } from "@/hooks/useTranslation";

export default function RemindersPage() {
  const user = useRequireAuth();
  const { t } = useTranslation();

  if (!user) return null;

  return (
    <DashboardLayout title={t("remindersTitle")} subtitle={t("remindersSubtitle")}>
      <div className="max-w-4xl">
        <ReminderManager />
      </div>
    </DashboardLayout>
  );
}
