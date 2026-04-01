"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import DashboardLayout from "@/layouts/DashboardLayout";
import BlogEditor from "@/features/blog/components/BlogEditor";
import { useTranslation } from "@/hooks/useTranslation";

export default function NewBlogPostPage() {
  const user = useRequireAuth();
  const { t } = useTranslation();

  if (!user) return null;

  return (
    <DashboardLayout title={t("createPost")} subtitle={t("blogSubtitle")}>
      <BlogEditor />
    </DashboardLayout>
  );
}
