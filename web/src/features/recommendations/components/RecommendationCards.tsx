"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ChevronRight, X, Sparkles } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { recommendationService } from "../services/recommendation.service";
import { Recommendation } from "../types/recommendation.types";

const TYPE_COLORS: Record<string, string> = {
  breathing: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/20",
  exercise: "from-green-500/20 to-green-500/5 border-green-500/20",
  music: "from-purple-500/20 to-purple-500/5 border-purple-500/20",
  journal: "from-blue-500/20 to-blue-500/5 border-blue-500/20",
  professional: "from-red-500/20 to-red-500/5 border-red-500/20",
  social: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/20",
  sleep: "from-indigo-500/20 to-indigo-500/5 border-indigo-500/20",
  celebrate: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20",
};

export default function RecommendationCards() {
  const { t } = useTranslation();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await recommendationService.getRecommendations();
        setRecommendations(data.recommendations);
      } catch (err) {
        console.error("Failed to load recommendations:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  };

  const visible = recommendations.filter((r) => !dismissed.has(r.id));

  if (loading) return null;

  if (visible.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-center">
        <Sparkles size={20} className="mx-auto text-[var(--text-muted)] mb-2" />
        <p className="text-sm text-[var(--text-muted)]">
          {t("noRecommendations")}
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="size-1.5 rounded-full bg-[var(--accent)] pulse-dot" />
        <h3 className="text-sm font-semibold text-[var(--text)]">
          {t("recommendationsTitle")}
        </h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <AnimatePresence>
          {visible.map((rec, i) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-[var(--radius-lg)] border bg-gradient-to-br p-5 space-y-3 group
                ${TYPE_COLORS[rec.type] || TYPE_COLORS.breathing}`}
            >
              {/* Dismiss button */}
              <button
                onClick={() => handleDismiss(rec.id)}
                className="absolute top-3 right-3 p-1 rounded-md text-[var(--text-muted)]
                           opacity-0 group-hover:opacity-100 hover:text-[var(--text)]
                           hover:bg-white/5 transition-all"
              >
                <X size={14} />
              </button>

              <div className="flex items-start gap-3">
                <span className="text-2xl">{rec.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-[var(--text)] leading-tight">
                    {rec.title}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {rec.trigger}
                  </p>
                </div>
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {rec.description}
              </p>

              {rec.action && (
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
                                    bg-white/5 text-[var(--accent)] hover:bg-white/10 transition-all">
                  <Lightbulb size={12} />
                  {rec.action}
                  <ChevronRight size={12} />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
