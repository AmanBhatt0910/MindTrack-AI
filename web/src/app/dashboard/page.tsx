"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import DashboardLayout from "@/layouts/DashboardLayout";
import PostAnalyzer from "@/features/dashboard/components/PostAnalyzer";

export default function DashboardPage() {
  const user = useRequireAuth();

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">
          Analyze Social Media Post
        </h1>

        <PostAnalyzer />
      </div>
    </DashboardLayout>
  );
}