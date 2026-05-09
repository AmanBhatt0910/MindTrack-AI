"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import DashboardLayout from "@/layouts/DashboardLayout";
import GamesComponent from "@/features/games/components/GamesComponent";
import { useTranslation } from "@/hooks/useTranslation";

export default function GamesPage() {
  const user = useRequireAuth(["patient", "doctor", "admin"]);
  const { t } = useTranslation();

  if (!user) return null;

  return (
    <DashboardLayout
      title="Mental Health Games"
      subtitle="Play relaxing games to improve your mental wellbeing"
    >
      <div className="max-w-7xl mx-auto">
        <GamesComponent />
      </div>
    </DashboardLayout>
  );
}
