"use client";

import { useState } from "react";
import { Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PostInput from "@/features/posts/components/PostInput";
import LanguageSelect from "@/features/posts/components/LanguageSelect";
import AnalysisResult from "@/features/posts/components/AnalysisResult";
import VoiceRecorder from "@/features/voice/components/VoiceRecorder";
import Button from "@/components/ui/Button";
import { postService } from "@/features/posts/services/post.service";
import { AnalysisResponse } from "@/features/posts/types/post.types";
import { ANALYZER_COPY } from "@/constants/dashboard";

// ─── Skeleton placeholder ─────────────────────────────────────────────────────
function ResultSkeleton() {
  return (
    <div className="rounded-lg border border-(--border) bg-(--surface) p-6 space-y-5 h-full">
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 rounded shimmer" />
        <div className="h-5 w-20 rounded-full shimmer" />
      </div>
      <div className="h-px bg-(--border)" />
      <div className="space-y-2">
        <div className="h-3 w-20 rounded shimmer" />
        <div className="h-2 w-full rounded-full shimmer" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-32 rounded shimmer" />
        <div className="h-10 rounded-md shimmer" />
        <div className="h-10 rounded-md shimmer" />
        <div className="h-10 rounded-md shimmer" />
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div
      className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)]
                 bg-[var(--surface)] h-full flex flex-col items-center justify-center
                 gap-3 p-8 text-center min-h-[280px]"
    >
      <div className="size-10 rounded-full bg-[var(--surface-raised)] border border-[var(--border)]
                      flex items-center justify-center">
        <Sparkles size={16} className="text-[var(--text-muted)]" />
      </div>
      <p className="text-sm text-[var(--text-muted)] max-w-[200px] leading-relaxed">
        {ANALYZER_COPY.emptyState}
      </p>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader() {
  return (
    <div className="flex items-center gap-2 pb-1">
      <div className="size-1.5 rounded-full bg-[var(--accent)] pulse-dot" aria-hidden />
      <h2 className="text-sm font-semibold text-[var(--text)] tracking-[-0.01em]">
        Post analyzer
      </h2>
    </div>
  );
}

interface PostAnalyzerProps {
  onAnalysisComplete?: (analysis: AnalysisResponse) => void;
  initialResult?: AnalysisResponse | null;
}

export default function PostAnalyzer({ onAnalysisComplete, initialResult = null }: PostAnalyzerProps) {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(initialResult);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await postService.analyze(text, language);
      // Check if the API returned an error in the response body
      if (res.error) {
        setError(res.error);
        setResult(null);
      } else {
        setResult(res);
        onAnalysisComplete?.(res);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string; explanation?: string[] } } };
      const msg = axiosErr?.response?.data?.error
        || axiosErr?.response?.data?.explanation?.[0]
        || "Analysis failed. Is the ML model server running?";
      setError(msg);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="analyzer" className="space-y-4 scroll-mt-20">
      <SectionHeader />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left: input panel */}
        <div
          className="rounded-[var(--radius-lg)] border border-[var(--border)]
                     bg-[var(--surface)] p-6 space-y-4"
        >
          <PostInput value={text} onChange={setText} />

          {/* Voice input & language */}
          <div className="flex items-center justify-between gap-4">
            <VoiceRecorder
              language={language}
              onTranscript={(t) => setText((prev) => prev ? prev + " " + t : t)}
            />
            <LanguageSelect value={language} onChange={setLanguage} />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-xs text-red-400"
              >
                <AlertCircle size={12} className="shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={handleAnalyze}
            loading={loading}
            disabled={!text.trim()}
            className="w-full"
            icon={<Sparkles size={14} />}
          >
            {loading ? "Analyzing…" : "Analyze post"}
          </Button>
        </div>

        {/* Right: result panel */}
        <div className="min-h-[280px]">
          {loading ? (
            <ResultSkeleton />
          ) : result ? (
            <AnalysisResult data={result} />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </section>
  );
}