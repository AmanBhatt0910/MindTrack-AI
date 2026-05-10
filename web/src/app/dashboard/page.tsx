"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthStore } from "@/store/useAuthStore";
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
import { MapPin, Loader2, AlertCircle, Sparkles, Smile, Gamepad2, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import ConnectedPatientsWidget from "@/features/dashboard/components/ConnectedPatientsWidget";

export default function DashboardPage() {
  const user = useRequireAuth(["patient", "doctor", "admin"]);
  const { isDoctor } = useAuthStore();
  const { t } = useTranslation();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResponse | null>(null);

  // Initialize global location at the dashboard root so all child components share it
  const { status: locationStatus } = useLocation();

  const fetchHistory = useCallback(async () => {
    if (!user || !isDoctor()) return;
    
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
  }, [user, isDoctor]);

  useEffect(() => {
    if (user && isDoctor()) {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [user, isDoctor, fetchHistory]);

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

  if (error && isDoctor()) {
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

        {!isDoctor() && (
          <div className="space-y-8">
            {/* Patient Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white shadow-lg">
              <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                <Sparkles size={250} />
              </div>
              <div className="relative z-10 max-w-2xl">
                <h1 className="text-3xl font-bold mb-2">Good to see you, {user.name}! 👋</h1>
                <p className="text-emerald-50 text-lg mb-6 opacity-90">
                  How are you feeling today? Taking a moment to check in with yourself is a great start.
                </p>
                <div className="flex gap-4">
                  <Link href="/mood" className="flex items-center gap-2 bg-white text-teal-700 px-6 py-3 rounded-xl font-bold shadow-sm hover:shadow-md hover:bg-emerald-50 transition-all">
                    <Smile size={18} />
                    Log Your Mood
                  </Link>
                  <Link href="/games" className="flex items-center gap-2 bg-black/20 backdrop-blur-sm text-white border border-white/20 px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-black/30 transition-all">
                    <Gamepad2 size={18} />
                    Play a Game
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div>
              <h2 className="text-lg font-bold text-[var(--text)] mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/chat" className="group flex flex-col items-center justify-center p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-md">
                    <MessageCircle size={24} />
                  </div>
                  <h3 className="font-bold text-[var(--text)]">AI Wellness Guide</h3>
                  <p className="text-xs text-[var(--text-muted)] text-center mt-2">Chat with our AI for immediate support and guidance.</p>
                </Link>
                <Link href="/messages" className="group flex flex-col items-center justify-center p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-md">
                    <MessageCircle size={24} />
                  </div>
                  <h3 className="font-bold text-[var(--text)]">Doctor Messages</h3>
                  <p className="text-xs text-[var(--text-muted)] text-center mt-2">Communicate directly with your assigned therapist.</p>
                </Link>
                <Link href="/reminders" className="group flex flex-col items-center justify-center p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-orange-500/50 hover:bg-orange-500/5 transition-all shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-md">
                    <AlertCircle size={24} />
                  </div>
                  <h3 className="font-bold text-[var(--text)]">Your Reminders</h3>
                  <p className="text-xs text-[var(--text-muted)] text-center mt-2">Manage your daily tasks and medication schedules.</p>
                </Link>
              </div>
            </div>
          </div>
        )}

        {isDoctor() && (
          <>
            <ConnectedPatientsWidget />
            <StatsCards history={history} />
            {currentAnalysis && (
              <CounselorAlertBanner analysis={currentAnalysis} />
            )}
            {currentAnalysis && (
              <TherapistAutoMessageAlert analysis={currentAnalysis} />
            )}
          </>
        )}

        {/* Both Patient and Doctor can use the Post Analyzer.
            Patients can save it, Doctors can view history directly inline. */}
        <PostAnalyzer 
          onAnalysisComplete={handleAnalysisComplete}
          initialResult={currentAnalysis}
        />
        
        <RecommendationCards />
        {currentAnalysis && (
          <GamesAndMusicPanel prediction={currentAnalysis.prediction} />
        )}
        
        {isDoctor() && (
          <>
            <AnalysisChart history={history} />
            <HistoryList data={history} />
          </>
        )}
        
        <MentalHealthInfo />
      </div>
    </DashboardLayout>
  );
}