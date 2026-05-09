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
import { AnalysisResponse } from "@/features/posts/types/post.types";
import { api } from "@/lib/axios";
import { useTranslation } from "@/hooks/useTranslation";
import CounselorAlertBanner from "@/features/counselor-alert/components/CounselorAlertBanner";
import RecommendationCards from "@/features/recommendations/components/RecommendationCards";
import TherapistAutoMessageAlert from "@/features/nearby/components/TherapistAutoMessageAlert";
import GamesAndMusicPanel from "@/features/recommendations/components/GamesAndMusicPanel";
import { useLocation } from "@/hooks/useLocation";
import { MapPin, Loader2, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const user = useRequireAuth(["patient"]);
  const { t } = useTranslation();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResponse | null>(null);

  // Initialize global location at the dashboard root so all child components share it
  const { status: locationStatus } = useLocation();

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.get<AnalysisResponse[]>("/analysis");
      const data = res.data;

      const mapped: HistoryItem[] = data.map((item) => ({
        id: item._id!,
        text: item.text!,
        prediction: item.prediction,
        confidence: item.confidence,
        explanation: item.explanation,
        createdAt: item.createdAt!,
        // Include mlData if needed for history view
        mlData: item.mlData,
      }));
      setHistory(mapped);
    } catch (err) {
      console.error("Error fetching history:", err);
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

        {/* Location status banner */}
        {locationStatus === "loading" && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text-muted)]">
            <Loader2 size={12} className="animate-spin shrink-0" />
            {t("locationBannerDetermining")}
          </div>
        )}
        {locationStatus === "granted" && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] border border-green-500/20 bg-green-500/6 text-xs text-green-400">
            <MapPin size={12} className="shrink-0" />
            {t("locationBannerGranted")}
          </div>
        )}
        {locationStatus === "denied" && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] border border-amber-500/20 bg-amber-500/6 text-xs text-amber-400">
            <AlertCircle size={12} className="shrink-0" />
            {t("locationBannerDenied")}
          </div>
        )}

        <StatsCards history={history} />
        {currentAnalysis && (
          <CounselorAlertBanner analysis={currentAnalysis} />
        )}
        {currentAnalysis && (
          <TherapistAutoMessageAlert analysis={currentAnalysis} />
        )}
        <PostAnalyzer 
          onAnalysisComplete={handleAnalysisComplete}
          initialResult={currentAnalysis}
        />
        <RecommendationCards />
        {currentAnalysis && (
          <GamesAndMusicPanel prediction={currentAnalysis.prediction} />
        )}
        <AnalysisChart history={history} />
        <HistoryList data={history} />
        <MentalHealthInfo />
      </div>
    </DashboardLayout>
  );
}