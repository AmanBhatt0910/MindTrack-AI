"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import DashboardLayout from "@/layouts/DashboardLayout";
import BlogPostView from "@/features/blog/components/BlogPostView";
import { blogService } from "@/features/blog/services/blog.service";
import { BlogPostData } from "@/features/blog/types/blog.types";
import { useTranslation } from "@/hooks/useTranslation";

export default function BlogPostPage() {
  const user = useRequireAuth();
  const { t } = useTranslation();
  const params = useParams();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && params.id) {
      blogService
        .getById(params.id as string)
        .then(setPost)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, params.id]);

  if (!user) return null;

  if (loading) {
    return (
      <DashboardLayout title={t("loading")}>
        <div className="flex justify-center py-12">
          <div className="animate-pulse text-[var(--text-muted)]">{t("loading")}</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!post) {
    return (
      <DashboardLayout title="Post not found">
        <div className="text-center py-12 text-[var(--text-muted)]">
          Post not found or has been removed.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={post.title}>
      <BlogPostView post={post} />
    </DashboardLayout>
  );
}
