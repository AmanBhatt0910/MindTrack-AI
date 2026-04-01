"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { PenLine, Filter } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { blogService } from "../services/blog.service";
import { BlogPostData, EMOTION_TAGS } from "../types/blog.types";
import BlogCard from "./BlogCard";

export default function BlogList() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<BlogPostData[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTag, setActiveTag] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await blogService.list(page, activeTag);
      setPosts(res.posts);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error("Failed to fetch blog posts:", err);
    } finally {
      setLoading(false);
    }
  }, [page, activeTag]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLike = async (id: string) => {
    try {
      const result = await blogService.toggleLike(id);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, likes: result.likes } : p
        )
      );
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-1.5 rounded-full bg-[var(--accent)] pulse-dot" />
          <h2 className="text-sm font-semibold text-[var(--text)]">
            {t("blogTitle")}
          </h2>
        </div>

        <Link
          href="/blog/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] text-[#080c10] text-sm font-medium
                     hover:opacity-90 transition-opacity"
        >
          <PenLine size={14} />
          {t("createPost")}
        </Link>
      </div>

      {/* Tag filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-[var(--text-muted)]" />
        <button
          onClick={() => { setActiveTag(undefined); setPage(1); }}
          className={`px-3 py-1 rounded-md text-xs font-medium transition ${
            !activeTag
              ? "bg-[var(--accent)] text-[#080c10]"
              : "bg-[var(--surface-raised)] text-[var(--text-secondary)] hover:bg-[var(--surface-raised)]"
          }`}
        >
          {t("allPosts")}
        </button>
        {EMOTION_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => { setActiveTag(tag); setPage(1); }}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              activeTag === tag
                ? "bg-[var(--accent)] text-[#080c10]"
                : "bg-[var(--surface-raised)] text-[var(--text-secondary)] hover:bg-[var(--surface-raised)]"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Posts grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3"
            >
              <div className="h-3 w-16 rounded shimmer" />
              <div className="h-4 w-3/4 rounded shimmer" />
              <div className="h-12 rounded shimmer" />
              <div className="h-3 w-1/2 rounded shimmer" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center"
        >
          <PenLine size={28} className="mx-auto text-[var(--text-muted)] mb-3" />
          <p className="text-sm text-[var(--text-muted)]">{t("noPosts")}</p>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post._id} post={post} onLike={handleLike} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`size-8 rounded-md text-xs font-medium transition ${
                page === p
                  ? "bg-[var(--accent)] text-[#080c10]"
                  : "bg-[var(--surface-raised)] text-[var(--text-secondary)] hover:bg-[var(--surface-raised)]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
