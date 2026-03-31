"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import DashboardLayout from "@/layouts/DashboardLayout";
import StatsCards from "@/features/dashboard/components/StatsCards";
import PostAnalyzer from "@/features/dashboard/components/PostAnalyzer";
import AnalysisChart from "@/features/dashboard/components/AnalysisChart";
import HistoryList from "@/features/dashboard/components/HistoryList";
import MentalHealthInfo from "@/features/dashboard/components/MentalHealthInfo";
import StrugglingButton from "@/features/crisis/components/StrugglingButton";
import { HistoryItem } from "@/features/dashboard/types/history.types";
import { useEffect, useState, useCallback } from "react";
import { MentalState } from "@/features/posts/types/post.types";
import { api } from "@/lib/axios";
import { useTranslation } from "@/hooks/useTranslation";

interface AnalysisDocument {
  _id: string;
  text: string;
  prediction: string;
  confidence: number;
  explanation: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export default function DashboardPage() {
  const user = useRequireAuth();
  const { t } = useTranslation();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await api.get<AnalysisDocument[]>("/analysis");
      const data = res.data;

      const mapped: HistoryItem[] = data.map((item) => ({
        id: item._id,
        text: item.text,
        prediction: item.prediction as MentalState,
        confidence: item.confidence,
        explanation: item.explanation,
        createdAt: item.createdAt,
      }));
      setHistory(mapped);
      setError(null);
    } catch (err) {
      setError("Could not load analysis history.");
    }
  }, []);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchHistory();
    }
  }, [user, fetchHistory]);

  const refreshHistory = () => {
    fetchHistory();
  };

  if (!user) return null;

  if (loading) {
    return (
      <DashboardLayout title={t("dashboardTitle")} subtitle={t("loading")}>
        <div className="flex justify-center py-12">
          <div className="animate-pulse text-muted">{t("loading")}</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title={t("dashboardTitle")} subtitle={t("dashboardSubtitle")}>
        <div className="text-red-500">Error: {error}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={t("dashboardTitle")}
      subtitle={t("dashboardSubtitle")}
    >
      {error && (
        <div className="mb-4 rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}
      <div className="space-y-8 max-w-6xl">
        {/* I'm Struggling button — prominent, top of page */}
        <div className="flex justify-end">
          <StrugglingButton />
        </div>

        <StatsCards history={history} />
        <PostAnalyzer onAnalysisComplete={refreshHistory} />
        <AnalysisChart history={history} />
        <HistoryList data={history} />
        <MentalHealthInfo />
      </div>
    </DashboardLayout>
  );
}