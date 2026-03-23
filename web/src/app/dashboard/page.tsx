"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import DashboardLayout from "@/layouts/DashboardLayout";
import PostAnalyzer from "@/features/dashboard/components/PostAnalyzer";
import StatsCards from "@/features/dashboard/components/StatsCards";
import HistoryList from "@/features/dashboard/components/HistoryList";
import { HistoryItem } from "@/features/dashboard/types/history.types";
import { exportToPDF } from "@/utils/exportPDF";
import Button from "@/components/ui/Button";
import AnalysisChart from "@/features/dashboard/components/AnalysisChart";

const dummyHistory: HistoryItem[] = [
  {
    id: "1",
    text: "I feel very sad and tired",
    prediction: "Depression",
    confidence: 0.8,
    explanation: ["Detected negative sentiment"],
    createdAt: new Date().toISOString(),
  },
];

export default function DashboardPage() {
  const user = useRequireAuth();

  if (!user) return null;

  return (
    <DashboardLayout>
      <div id="dashboard" className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>

          <Button onClick={() => exportToPDF("dashboard")}>
            Export Report
          </Button>
        </div>

        {/* Stats */}
        <StatsCards />

        {/* Analyzer */}
        <PostAnalyzer />

        {/* Chart */}
        <AnalysisChart />

        {/* History */}
        <div id="history">
          <h2 className="text-lg font-semibold mb-3">
            Recent Analyses
          </h2>

          <HistoryList data={dummyHistory} />
        </div>
      </div>
    </DashboardLayout>
  );
}