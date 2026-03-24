"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import DashboardLayout from "@/layouts/DashboardLayout";
import StatsCards from "@/features/dashboard/components/StatsCards";
import PostAnalyzer from "@/features/dashboard/components/PostAnalyzer";
import AnalysisChart from "@/features/dashboard/components/AnalysisChart";
import HistoryList from "@/features/dashboard/components/HistoryList";
import { HistoryItem } from "@/features/dashboard/types/history.types";

// Dummy history data — replace with API call when backend is ready
const DUMMY_HISTORY: HistoryItem[] = [
  {
    id: "1",
    text: "I feel very sad and tired all the time, nothing seems to help anymore.",
    prediction: "Depression",
    confidence: 0.87,
    explanation: ["Detected negative sentiment", "Use of emotionally heavy words", "Low energy tone"],
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "2",
    text: "Can't stop worrying about everything, my heart is racing.",
    prediction: "Anxiety",
    confidence: 0.74,
    explanation: ["Detected fear and worry markers", "Physiological symptom mention"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "3",
    text: "Just had a great run this morning, feeling energized and ready!",
    prediction: "Neutral",
    confidence: 0.91,
    explanation: ["Positive sentiment detected", "Active, energetic language"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

export default function DashboardPage() {
  const user = useRequireAuth();
  if (!user) return null;

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Monitor mental health signals across your analyzed posts"
    >
      <div className="space-y-8 max-w-6xl">
        {/* Stats row */}
        <StatsCards />

        {/* Post analyzer */}
        <PostAnalyzer />

        {/* Chart */}
        <AnalysisChart />

        {/* History */}
        <HistoryList data={DUMMY_HISTORY} />
      </div>
    </DashboardLayout>
  );
}