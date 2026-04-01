"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  MapPin,
  Phone,
  Send,
  X,
} from "lucide-react";
import { AnalysisResponse } from "@/features/posts/types/post.types";
import {
  buildTherapistAlertMessage,
  getNearbyTherapists,
  NearbyTherapist,
  shouldSendTherapistAlert,
} from "../services/therapistAutoMessage";

interface TherapistAutoMessageAlertProps {
  analysis: AnalysisResponse;
  onDismiss?: () => void;
}

function TherapistCard({
  therapist,
  isSelected,
  onSelect,
}: {
  therapist: NearbyTherapist;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-[var(--radius-md)] border p-3 transition-all duration-200
        ${
          isSelected
            ? "border-rose-500/40 bg-rose-500/8"
            : "border-[var(--border)] bg-[var(--surface-raised)] hover:border-[var(--border-active)]"
        }`}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="size-8 rounded-full bg-rose-500/15 border border-rose-500/25
                       flex items-center justify-center text-xs font-bold text-rose-400 shrink-0"
        >
          {therapist.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[var(--text)]">
              {therapist.name}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border
                ${
                  therapist.available
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : "bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)]"
                }`}
            >
              <span
                className={`size-1 rounded-full ${therapist.available ? "bg-green-400" : "bg-[var(--text-muted)]"}`}
              />
              {therapist.available ? "Available" : "Unavailable"}
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            {therapist.title} · {therapist.distanceKm} km away
          </p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {therapist.specialization.map((s) => (
              <span
                key={s}
                className="px-1.5 py-0.5 rounded-full text-[10px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)]"
              >
                {s}
              </span>
            ))}
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
              <Phone size={10} />
              {therapist.phone}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
              <Mail size={10} />
              {therapist.email}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
              <MapPin size={10} />
              {therapist.address}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function TherapistAutoMessageAlert({
  analysis,
  onDismiss,
}: TherapistAutoMessageAlertProps) {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(
    null
  );
  const [sentToIds, setSentToIds] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);

  if (!shouldSendTherapistAlert(analysis) || dismissed) return null;

  const therapists = getNearbyTherapists(analysis);
  const selectedTherapist =
    therapists.find((t) => t.id === selectedTherapistId) ?? therapists[0];

  const handleSend = () => {
    if (!selectedTherapist || sending) return;
    setSending(true);
    setTimeout(() => {
      setSentToIds((prev) => new Set(prev).add(selectedTherapist.id));
      setSending(false);
    }, 900);
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const allSent = therapists.every((t) => sentToIds.has(t.id));
  const currentSent = sentToIds.has(selectedTherapist.id);
  const alertMessage = buildTherapistAlertMessage(analysis, selectedTherapist);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="rounded-[var(--radius-lg)] border border-rose-500/30 bg-rose-500/6 p-4 space-y-3"
        >
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-full bg-rose-500/15 border border-rose-500/25 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle size={14} className="text-rose-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-rose-300">
                Nearby Therapist Alert
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                High-risk signal detected ({Math.round(analysis.confidence * 100)}%
                confidence). Nearby therapists have been identified.
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="size-6 rounded-md flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)] transition-all shrink-0"
              aria-label="Dismiss"
            >
              <X size={12} />
            </button>
          </div>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-rose-300/80 hover:text-rose-300 transition-colors"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {expanded ? "Hide" : "Show"} nearby therapist details (
            {therapists.length} found)
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden space-y-3"
              >
                {/* Therapist cards */}
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {therapists.map((t) => (
                    <div key={t.id} className="relative">
                      <TherapistCard
                        therapist={t}
                        isSelected={
                          (selectedTherapistId ?? therapists[0].id) === t.id
                        }
                        onSelect={() => setSelectedTherapistId(t.id)}
                      />
                      {sentToIds.has(t.id) && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-500/15 border border-green-500/25">
                          <CheckCircle size={10} className="text-green-400" />
                          <span className="text-[10px] text-green-400 font-medium">
                            Sent
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Message preview */}
                <div className="rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border)] p-3">
                  <p className="text-[11px] text-[var(--text-muted)] font-medium mb-1.5">
                    Auto-composed message to {selectedTherapist.name}:
                  </p>
                  <pre className="text-[11px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap font-mono">
                    {alertMessage}
                  </pre>
                </div>

                {/* Send actions */}
                {allSent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] bg-green-500/10 border border-green-500/25"
                  >
                    <CheckCircle size={14} className="text-green-400 shrink-0" />
                    <p className="text-xs font-medium text-green-400">
                      All alerts sent. Therapists have been notified and will
                      reach out to you shortly.
                    </p>
                  </motion.div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSend}
                      disabled={sending || currentSent}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium
                                 bg-rose-500/15 text-rose-300 border border-rose-500/30
                                 hover:bg-rose-500/25 disabled:opacity-60 transition-all duration-200"
                    >
                      {sending ? (
                        <span className="size-3 rounded-full border border-rose-400 border-t-transparent animate-spin" />
                      ) : currentSent ? (
                        <CheckCircle size={11} />
                      ) : (
                        <Send size={11} />
                      )}
                      {currentSent
                        ? "Alert Sent"
                        : sending
                          ? "Sending…"
                          : `Alert ${selectedTherapist.name.split(" ")[1] ?? selectedTherapist.name}`}
                    </button>
                    {!currentSent && (
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Next available: {selectedTherapist.nextAvailable}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
