"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import DashboardLayout from "@/layouts/DashboardLayout";
import NearbyCounselors from "@/features/nearby/components/NearbyCounselors";
import { useTranslation } from "@/hooks/useTranslation";

export default function NearbyPage() {
  const user = useRequireAuth();
  const { t } = useTranslation();

  if (!user) return null;

  return (
    <DashboardLayout title={t("nearbyTitle")} subtitle={t("nearbySubtitle")}>
      <div className="max-w-6xl">
        <NearbyCounselors />
      </div>
    </DashboardLayout>
  );
}
