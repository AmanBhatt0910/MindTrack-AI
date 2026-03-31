"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import DashboardLayout from "@/layouts/DashboardLayout";
import MoodInput from "@/features/mood/components/MoodInput";
import MoodTimeline from "@/features/mood/components/MoodTimeline";
import { useTranslation } from "@/hooks/useTranslation";
import { useState } from "react";

export default function MoodPage() {
  const user = useRequireAuth();
  const { t } = useTranslation();
  const [refreshKey, setRefreshKey] = useState(0);

  if (!user) return null;

  return (
    <DashboardLayout title={t("moodTitle")} subtitle={t("moodSubtitle")}>
      <div className="space-y-8 max-w-6xl">
        {/* Log mood section */}
        <MoodInput onSaved={() => setRefreshKey((k) => k + 1)} />

        {/* Timeline & history */}
        <div key={refreshKey} className="space-y-4">
          <div className="flex items-center gap-2 pb-1">
            <div className="size-1.5 rounded-full bg-[var(--accent)] pulse-dot" aria-hidden />
            <h2 className="text-sm font-semibold text-[var(--text)] tracking-[-0.01em]">
              {t("moodTimeline")}
            </h2>
          </div>
          <MoodTimeline />
        </div>
      </div>
    </DashboardLayout>
  );
}
