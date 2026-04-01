"use client";

import { motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { Spike } from "../types/analytics.types";
import { useTranslation } from "@/hooks/useTranslation";

interface SpikeAlertProps {
  spikes: Spike[];
}

export default function SpikeAlert({ spikes }: SpikeAlertProps) {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || spikes.length === 0) return null;

  const highestSpike = spikes.sort((a, b) => b.delta - a.delta)[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      className="rounded-[var(--radius-lg)] border border-orange-500/30 bg-orange-500/5 px-4 py-3 flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
          <AlertTriangle size={14} className="text-orange-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-orange-300">
            {t("spikeDetected")}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            <span className="capitalize">{highestSpike.category}</span> increased
            by {(highestSpike.delta * 100).toFixed(0)}% on{" "}
            {new Date(highestSpike.date).toLocaleDateString()}
          </p>
        </div>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)] transition"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}
