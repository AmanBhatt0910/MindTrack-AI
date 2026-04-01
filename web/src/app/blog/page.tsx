"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import DashboardLayout from "@/layouts/DashboardLayout";
import BlogList from "@/features/blog/components/BlogList";
import { useTranslation } from "@/hooks/useTranslation";

export default function BlogPage() {
  const user = useRequireAuth();
  const { t } = useTranslation();

  if (!user) return null;

  return (
    <DashboardLayout title={t("blogTitle")} subtitle={t("blogSubtitle")}>
      <div className="max-w-6xl">
        <BlogList />
      </div>
    </DashboardLayout>
  );
}
