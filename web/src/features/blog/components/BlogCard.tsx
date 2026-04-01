"use client";

import { motion } from "framer-motion";
import { Heart, MessageCircle, Clock, User } from "lucide-react";
import Link from "next/link";
import { BlogPostData, EMOTION_TAG_COLORS } from "../types/blog.types";

interface BlogCardProps {
  post: BlogPostData;
  onLike?: (id: string) => void;
}

export default function BlogCard({ post, onLike }: BlogCardProps) {
  const preview =
    post.content.length > 150
      ? post.content.slice(0, 150) + "…"
      : post.content;

  const timeAgo = getTimeAgo(post.createdAt);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]
                 overflow-hidden group transition-all hover:border-[var(--border-active)]
                 hover:shadow-[var(--shadow-glow)]"
    >
      <Link href={`/blog/${post._id}`} className="block p-5 space-y-3">
        {/* Tags */}
        {post.emotionTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.emotionTags.map((tag) => (
              <span
                key={tag}
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium border
                  ${EMOTION_TAG_COLORS[tag] || "bg-[var(--surface-raised)] text-[var(--text-muted)]"}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="text-sm font-semibold text-[var(--text)] leading-snug group-hover:text-[var(--accent)] transition-colors">
          {post.title}
        </h3>

        {/* Preview */}
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          {preview}
        </p>
      </Link>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border)] bg-[var(--bg-secondary)]/30">
        <div className="flex items-center gap-3">
          {/* Author */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <User size={12} />
            <span>{post.isAnonymous ? "Anonymous" : post.authorName}</span>
          </div>

          {/* Time */}
          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Clock size={10} />
            <span>{timeAgo}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Likes */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onLike?.(post._id);
            }}
            className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-red-400 transition"
          >
            <Heart size={12} />
            <span>{post.likes}</span>
          </button>

          {/* Comments */}
          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <MessageCircle size={12} />
            <span>{post.comments.length}</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
