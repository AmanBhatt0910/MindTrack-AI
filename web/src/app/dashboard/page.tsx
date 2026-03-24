"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import DashboardLayout from "@/layouts/DashboardLayout";
import StatsCards from "@/features/dashboard/components/StatsCards";
import PostAnalyzer from "@/features/dashboard/components/PostAnalyzer";
import AnalysisChart from "@/features/dashboard/components/AnalysisChart";
import HistoryList from "@/features/dashboard/components/HistoryList";
import { HistoryItem } from "@/features/dashboard/types/history.types";
import { useEffect, useState, useCallback } from "react";
import { MentalState } from "@/features/posts/types/post.types"; // Import MentalState

// Type for the MongoDB document returned from the API
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
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/analysis");
      if (!res.ok) throw new Error("Failed to fetch history");
      const data: AnalysisDocument[] = await res.json();

      // Map MongoDB documents to HistoryItem shape, casting prediction to MentalState
      const mapped: HistoryItem[] = data.map((item) => ({
        id: item._id,
        text: item.text,
        prediction: item.prediction as MentalState, // Type assertion
        confidence: item.confidence,
        explanation: item.explanation,
        createdAt: item.createdAt,
      }));
      setHistory(mapped);
    } catch (err) {
      console.error(err);
      setError("Could not load analysis history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user, fetchHistory]);

  // Refresh history after a new analysis is submitted
  const refreshHistory = () => {
    fetchHistory();
  };

  if (!user) return null;

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Loading your analyses...">
        <div className="flex justify-center py-12">
          <div className="animate-pulse text-muted">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Monitor mental health signals">
        <div className="text-red-500">Error: {error}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Monitor mental health signals across your analyzed posts"
    >
      <div className="space-y-8 max-w-6xl">
        <StatsCards />
        <PostAnalyzer onAnalysisComplete={refreshHistory} />
        <AnalysisChart />
        <HistoryList data={history} />
      </div>
    </DashboardLayout>
  );
}