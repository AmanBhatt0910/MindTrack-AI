"use client";

import { Mic, MicOff, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useTranslation } from "@/hooks/useTranslation";

interface VoiceRecorderProps {
  language?: string;
  onTranscript: (text: string) => void;
}

export default function VoiceRecorder({
  language = "en",
  onTranscript,
}: VoiceRecorderProps) {
  const { t } = useTranslation();
  const {
    isListening,
    interimTranscript,
    error,
    isSupported,
    toggle,
  } = useSpeechRecognition({
    language,
    onTranscript,
  });

  if (!isSupported) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
        <MicOff size={12} />
        <span>{t("voiceNotSupported")}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <motion.button
        type="button"
        onClick={toggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative flex items-center justify-center size-10 rounded-full border transition-all duration-300
          ${
            isListening
              ? "bg-red-500/20 border-red-500/40 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
              : "bg-[var(--surface-raised)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-active)] hover:text-[var(--accent)]"
          }`}
        title={isListening ? t("stopRecording") : t("startRecording")}
      >
        {isListening ? <MicOff size={16} /> : <Mic size={16} />}

        {/* Pulse rings */}
        <AnimatePresence>
          {isListening && (
            <>
              <motion.span
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
                className="absolute inset-0 rounded-full border border-red-500/30"
              />
              <motion.span
                initial={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 0.3,
                }}
                className="absolute inset-0 rounded-full border border-red-500/20"
              />
            </>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Status text */}
      <AnimatePresence mode="wait">
        {isListening && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="flex items-center gap-2"
          >
            <span className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ scaleY: [1, 2, 1] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                  className="w-0.5 h-3 rounded-full bg-red-400 origin-bottom"
                />
              ))}
            </span>
            <span className="text-xs text-red-400 font-medium">
              {t("listening")}
            </span>
          </motion.div>
        )}

        {interimTranscript && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            className="text-xs text-[var(--text-muted)] italic max-w-[200px] truncate"
          >
            {interimTranscript}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1.5 text-xs text-red-400"
          >
            <AlertCircle size={12} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
