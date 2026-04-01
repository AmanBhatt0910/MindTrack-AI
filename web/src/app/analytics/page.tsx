"use client";

import { useEffect, useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import DashboardLayout from "@/layouts/DashboardLayout";
import TrendChart from "@/features/analytics/components/TrendChart";
import WeeklySummary from "@/features/analytics/components/WeeklySummary";
import SpikeAlert from "@/features/analytics/components/SpikeAlert";
import { useTranslation } from "@/hooks/useTranslation";
import { analyticsService } from "@/features/analytics/services/analytics.service";
import { TrendsResponse } from "@/features/analytics/types/analytics.types";

export default function AnalyticsPage() {
  const user = useRequireAuth();
  const { t } = useTranslation();
  const [data, setData] = useState<TrendsResponse | null>(null);

  useEffect(() => {
    if (user) {
      analyticsService.getTrends("7d").then(setData).catch(console.error);
    }
  }, [user]);

  if (!user) return null;

  return (
    <DashboardLayout
      title={t("analyticsTitle")}
      subtitle={t("analyticsSubtitle")}
    >
      <div className="space-y-6 max-w-6xl">
        {data?.spikes && <SpikeAlert spikes={data.spikes} />}
        <WeeklySummary summary={data?.summary ?? null} />
        <TrendChart />
      </div>
    </DashboardLayout>
  );
}
