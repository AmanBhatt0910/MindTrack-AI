"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Activity, BarChart3, AlertTriangle } from "lucide-react";
import { TrendSummary } from "../types/analytics.types";
import { useTranslation } from "@/hooks/useTranslation";

interface WeeklySummaryProps {
  summary: TrendSummary | null;
}

export default function WeeklySummary({ summary }: WeeklySummaryProps) {
  const { t } = useTranslation();

  if (!summary) return null;

  const trendIcon =
    summary.trend === "improving" ? (
      <TrendingDown size={14} className="text-green-400" />
    ) : summary.trend === "declining" ? (
      <TrendingUp size={14} className="text-red-400" />
    ) : (
      <Minus size={14} className="text-[var(--text-muted)]" />
    );

  const trendColor =
    summary.trend === "improving"
      ? "text-green-400"
      : summary.trend === "declining"
      ? "text-red-400"
      : "text-[var(--text-muted)]";

  const riskColor =
    summary.riskLevel === "high"
      ? "bg-red-500/15 text-red-400 border-red-500/30"
      : summary.riskLevel === "moderate"
      ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
      : "bg-green-500/15 text-green-400 border-green-500/30";

  const cards = [
    {
      label: t("dominantEmotion"),
      value: summary.dominantEmotion,
      icon: <Activity size={14} className="text-[var(--accent)]" />,
      className: "capitalize",
    },
    {
      label: t("riskLevel"),
      value: summary.riskLevel,
      icon: <AlertTriangle size={14} />,
      className: riskColor + " px-2 py-0.5 rounded-md border text-xs font-medium capitalize",
      isTag: true,
    },
    {
      label: t("moodScore"),
      value: summary.avgMoodScore > 0 ? `${summary.avgMoodScore}/10` : "—",
      icon: <BarChart3 size={14} className="text-[var(--accent)]" />,
    },
    {
      label: t("total"),
      value: `${summary.totalEntries} ${t("entries")}`,
      icon: trendIcon,
      subtitle: (
        <span className={`text-[10px] ${trendColor} capitalize`}>
          {summary.trend}
        </span>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-3"
    >
      {cards.map((card, i) => (
        <div
          key={i}
          className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 space-y-2"
        >
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            {card.icon}
            <span className="text-xs">{card.label}</span>
          </div>
          {card.isTag ? (
            <span className={card.className}>{card.value}</span>
          ) : (
            <p className={`text-lg font-semibold text-[var(--text)] ${card.className || ""}`}>
              {card.value}
            </p>
          )}
          {card.subtitle}
        </div>
      ))}
    </motion.div>
  );
}
