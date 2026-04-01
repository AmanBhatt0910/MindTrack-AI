"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Send, Save, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { blogService } from "../services/blog.service";
import { EMOTION_TAGS, EMOTION_TAG_COLORS } from "../types/blog.types";
import VoiceRecorder from "@/features/voice/components/VoiceRecorder";

export default function BlogEditor() {
  const { t } = useTranslation();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setPublishing(true);
    try {
      await blogService.create({
        title: title.trim(),
        content: content.trim(),
        emotionTags: selectedTags,
        isAnonymous,
      });
      toast.success(t("postPublished"));
      router.push("/blog");
    } catch (err) {
      toast.error("Failed to publish post");
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Title */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[var(--text-muted)]">
          {t("postTitle")}
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("postTitlePlaceholder")}
          maxLength={200}
          className="w-full px-4 py-3 rounded-[var(--radius-md)] text-lg font-semibold
                     bg-[var(--surface)] text-[var(--text)]
                     border border-[var(--border)] placeholder:text-[var(--text-muted)]
                     focus:border-[var(--border-active)] focus:outline-none
                     focus:shadow-[0_0_0_3px_var(--accent-glow)]
                     transition-all duration-200"
        />
        <p className="text-[10px] text-[var(--text-muted)] text-right">
          {title.length}/200
        </p>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[var(--text-muted)]">
            {t("postContent")}
          </label>
          <VoiceRecorder
            language="en"
            onTranscript={(text) =>
              setContent((prev) => (prev ? prev + " " + text : text))
            }
          />
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t("postContentPlaceholder")}
          maxLength={5000}
          rows={12}
          className="w-full px-4 py-3 rounded-[var(--radius-md)] text-sm
                     bg-[var(--surface)] text-[var(--text)]
                     border border-[var(--border)] placeholder:text-[var(--text-muted)]
                     focus:border-[var(--border-active)] focus:outline-none
                     focus:shadow-[0_0_0_3px_var(--accent-glow)]
                     resize-none transition-all duration-200 leading-relaxed"
        />
        <p className="text-[10px] text-[var(--text-muted)] text-right">
          {content.length}/5000
        </p>
      </div>

      {/* Emotion tags */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[var(--text-muted)]">
          {t("addTags")}
        </label>
        <div className="flex flex-wrap gap-2">
          {EMOTION_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all
                ${
                  selectedTags.includes(tag)
                    ? EMOTION_TAG_COLORS[tag]
                    : "bg-[var(--surface-raised)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-active)]"
                }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Anonymous toggle */}
      <div className="flex items-center gap-3 p-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]">
        <button
          onClick={() => setIsAnonymous(!isAnonymous)}
          className={`size-5 rounded border flex items-center justify-center transition
            ${
              isAnonymous
                ? "bg-[var(--accent)] border-[var(--accent)]"
                : "border-[var(--border)]"
            }`}
        >
          {isAnonymous && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6L5 9L10 3" stroke="#080c10" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
        <div className="flex items-center gap-2">
          {isAnonymous ? (
            <EyeOff size={14} className="text-[var(--text-muted)]" />
          ) : (
            <Eye size={14} className="text-[var(--text-muted)]" />
          )}
          <span className="text-sm text-[var(--text-secondary)]">
            {t("postAnonymously")}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handlePublish}
          disabled={publishing || !title.trim() || !content.trim()}
          className="flex items-center gap-2 px-6 py-2.5 rounded-[var(--radius-md)] text-sm font-medium
                     bg-[var(--accent)] text-[#080c10] hover:opacity-90
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-all duration-200"
        >
          <Send size={14} />
          {publishing ? t("loading") : t("publishPost")}
        </button>

        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-6 py-2.5 rounded-[var(--radius-md)] text-sm font-medium
                     bg-[var(--surface-raised)] text-[var(--text-secondary)] border border-[var(--border)]
                     hover:bg-[var(--surface-raised)] transition-all"
        >
          <Save size={14} />
          {t("cancel")}
        </button>
      </div>
    </motion.div>
  );
}
