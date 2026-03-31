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
import { MentalState, AnalysisResponse } from "@/features/posts/types/post.types";
import { api } from "@/lib/axios";
import { useTranslation } from "@/hooks/useTranslation";
import CounselorAlertBanner from "@/features/counselor-alert/components/CounselorAlertBanner";

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
  const [loading, setLoading] = useState(true);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResponse | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
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
    } catch {
      setError("Could not load analysis history.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user, fetchHistory]);

  const refreshHistory = () => {
    fetchHistory();
  };

  const handleAnalysisComplete = (analysis: AnalysisResponse) => {
    setCurrentAnalysis(analysis);
    refreshHistory();
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
      <div className="space-y-8 max-w-6xl">
        {/* I'm Struggling button — prominent, top of page */}
        <div className="flex justify-end">
          <StrugglingButton />
        </div>

        <StatsCards history={history} />
        {currentAnalysis && (
          <CounselorAlertBanner analysis={currentAnalysis} />
        )}
        <PostAnalyzer 
          onAnalysisComplete={handleAnalysisComplete}
          initialResult={currentAnalysis}
        />
        <AnalysisChart history={history} />
        <HistoryList data={history} />
        <MentalHealthInfo />
      </div>
    </DashboardLayout>
  );
}