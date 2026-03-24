"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";
import { AnalysisResponse } from "../types/post.types";
import ExplanationCard from "./ExplanationCard";
import Badge from "@/components/ui/Badge";
import { PREDICTION_VARIANT } from "@/constants/dashboard";

// ─── Confidence bar ───────────────────────────────────────────────────────────
function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 80 ? "bg-red-400"
    : pct >= 60 ? "bg-amber-400"
    : "bg-emerald-400";

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-[var(--text-muted)]"
              style={{ fontFamily: "var(--font-mono)" }}>
          Confidence
        </span>
        <span className="text-xs font-bold text-[var(--text)]"
              style={{ fontFamily: "var(--font-mono)" }}>
          {pct}%
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[var(--surface-raised)] overflow-hidden">
        <motion.div
          className={clsx("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AnalysisResult({ data }: { data: AnalysisResponse }) {
  const badgeVariant = PREDICTION_VARIANT[data.prediction] ?? "default";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-[var(--radius-lg)] border border-[var(--border)]
                 bg-[var(--surface)] p-6 space-y-5 h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--text)] tracking-[-0.01em]">
          Analysis result
        </h2>
        <Badge variant={badgeVariant as "danger" | "warning" | "success" | "default"}>
          {data.prediction}
        </Badge>
      </div>

      {/* Divider */}
      <div className="h-px bg-[var(--border)]" />

      {/* Confidence */}
      <ConfidenceBar value={data.confidence} />

      {/* Explanation */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-widest"
           style={{ fontFamily: "var(--font-mono)" }}>
          Why this prediction
        </p>
        <div className="space-y-2">
          {data.explanation.map((exp, i) => (
            <ExplanationCard key={i} text={exp} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}