"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import DashboardLayout from "@/layouts/DashboardLayout";
import ChatWindow from "@/features/chatbot/components/ChatWindow";
import { useTranslation } from "@/hooks/useTranslation";

export default function ChatPage() {
  const user = useRequireAuth();
  const { t } = useTranslation();

  if (!user) return null;

  return (
    <DashboardLayout title={t("chatTitle")} subtitle={t("chatSubtitle")}>
      <div className="h-[calc(100vh-10rem)] rounded-[var(--radius-lg)] border border-[var(--border)] overflow-hidden">
        <ChatWindow />
      </div>
    </DashboardLayout>
  );
}
