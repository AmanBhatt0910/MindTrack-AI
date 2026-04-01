"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  ArrowLeft,
  User,
  Clock,
  Send,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { blogService } from "../services/blog.service";
import { BlogPostData, EMOTION_TAG_COLORS } from "../types/blog.types";
import { useAuthStore } from "@/store/useAuthStore";

interface BlogPostViewProps {
  post: BlogPostData;
}

export default function BlogPostView({ post: initialPost }: BlogPostViewProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();
  const [post, setPost] = useState(initialPost);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isOwner = user && post.userId === user.id;

  const handleLike = async () => {
    try {
      const result = await blogService.toggleLike(post._id);
      setPost((prev) => ({ ...prev, likes: result.likes }));
    } catch {
      toast.error("Failed to like post");
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const updated = await blogService.addComment(post._id, comment.trim());
      setPost(updated);
      setComment("");
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await blogService.delete(post._id);
      toast.success(t("postDeleted"));
      router.push("/blog");
    } catch {
      toast.error("Failed to delete post");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Back button */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition"
      >
        <ArrowLeft size={14} />
        {t("back")}
      </Link>

      {/* Post */}
      <article className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="p-6 space-y-4">
          {/* Tags */}
          {post.emotionTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.emotionTags.map((tag) => (
                <span
                  key={tag}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border
                    ${EMOTION_TAG_COLORS[tag] || "bg-[var(--surface-raised)] text-[var(--text-muted)]"}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-xl font-bold text-[var(--text)] leading-tight">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-1.5">
              <User size={12} />
              <span>{post.isAnonymous ? t("anonymous") : post.authorName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={10} />
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Content */}
          <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--border)] bg-[var(--bg-secondary)]/30">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-red-400 transition"
            >
              <Heart size={14} />
              <span>{post.likes}</span>
            </button>

            <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
              <MessageCircle size={14} />
              <span>{post.comments.length}</span>
            </div>
          </div>

          {isOwner && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-red-400 transition"
            >
              <Trash2 size={12} />
              {t("deletePost")}
            </button>
          )}
        </div>
      </article>

      {/* Comments */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-[var(--text)]">
          {t("comments")} ({post.comments.length})
        </h3>

        {/* Add comment */}
        <div className="flex gap-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("addComment")}
            rows={2}
            maxLength={1000}
            className="flex-1 px-4 py-2.5 rounded-[var(--radius-md)] text-sm
                       bg-[var(--surface)] text-[var(--text)]
                       border border-[var(--border)] placeholder:text-[var(--text-muted)]
                       focus:border-[var(--border-active)] focus:outline-none
                       resize-none transition-all"
          />
          <button
            onClick={handleComment}
            disabled={!comment.trim() || submitting}
            className="shrink-0 size-11 rounded-[var(--radius-md)] bg-[var(--accent)] text-[#080c10]
                       flex items-center justify-center
                       disabled:opacity-40 disabled:cursor-not-allowed
                       hover:opacity-90 transition"
          >
            <Send size={14} />
          </button>
        </div>

        {/* Comment list */}
        <div className="space-y-3">
          {post.comments.map((c, i) => (
            <div
              key={c._id || i}
              className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 space-y-2"
            >
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <User size={12} />
                <span className="font-medium text-[var(--text)]">
                  {c.authorName}
                </span>
                <span>·</span>
                <span>{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {c.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
