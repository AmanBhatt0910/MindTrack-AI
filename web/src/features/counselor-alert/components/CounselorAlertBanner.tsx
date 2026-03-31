"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Bell, CheckCircle, X, Send, User } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { AnalysisResponse } from "@/features/posts/types/post.types";

interface CounselorAlertBannerProps {
  analysis: AnalysisResponse;
  onDismiss?: () => void;
}

// Rule-based trigger: alert when prediction is high-risk AND confidence is high
function shouldTriggerAlert(analysis: AnalysisResponse): boolean {
  const highRiskStates = ["Depression", "Bipolar"];
  const moderateRiskStates = ["Anxiety", "Stress"];

  if (highRiskStates.includes(analysis.prediction) && analysis.confidence >= 0.6) return true;
  if (moderateRiskStates.includes(analysis.prediction) && analysis.confidence >= 0.85) return true;
  return false;
}

function buildAlertMessage(analysis: AnalysisResponse): string {
  return `[AUTO-ALERT] A user requires support. Detection: ${analysis.prediction} (${Math.round(analysis.confidence * 100)}% confidence). Please reach out immediately. Key signals: ${analysis.explanation.slice(0, 3).join(", ")}.`;
}

export default function CounselorAlertBanner({ analysis, onDismiss }: CounselorAlertBannerProps) {
  const { t } = useTranslation();
  const [alertSent, setAlertSent] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!shouldTriggerAlert(analysis) || dismissed) return null;

  const alertMessage = buildAlertMessage(analysis);

  const handleSendAlert = () => {
    // Simulate sending alert (in production, this would call an API)
    setTimeout(() => setAlertSent(true), 800);
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="rounded-[var(--radius-lg)] border border-amber-500/30 bg-amber-500/8 p-4 space-y-3"
        >
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle size={14} className="text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-amber-300">
                {t("counselorAlertTitle")}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {t("counselorAlertDesc")}
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="size-6 rounded-md flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)] transition-all shrink-0"
              aria-label="Dismiss alert"
            >
              <X size={12} />
            </button>
          </div>

          {/* Alert sent state */}
          {alertSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] bg-green-500/10 border border-green-500/25"
            >
              <CheckCircle size={14} className="text-green-400 shrink-0" />
              <div>
                <p className="text-xs font-medium text-green-400">{t("alertSent")}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{t("alertSentDesc")}</p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {/* Auto-composed message preview */}
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border)] p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <User size={11} className="text-[var(--text-muted)]" />
                    <span className="text-[11px] text-[var(--text-muted)] font-medium">Auto-composed message to counselor:</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] font-mono leading-relaxed">
                    {alertMessage}
                  </p>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSendAlert}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium
                             bg-amber-500/15 text-amber-300 border border-amber-500/30
                             hover:bg-amber-500/25 transition-all duration-200"
                >
                  <Send size={11} />
                  {t("alertCounselor")}
                </button>
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs
                             text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)]
                             border border-[var(--border)] transition-all duration-200"
                >
                  <Bell size={11} />
                  {expanded ? t("hideMessage") : t("viewAlert")}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
