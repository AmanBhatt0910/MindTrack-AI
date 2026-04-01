"use client";

import { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import VoiceRecorder from "@/features/voice/components/VoiceRecorder";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const { t } = useTranslation();
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-[var(--border)] bg-[var(--surface)] p-4">
      {/* Voice recorder */}
      <div className="mb-2">
        <VoiceRecorder
          language="en"
          onTranscript={(transcript) =>
            setText((prev) => (prev ? prev + " " + transcript : transcript))
          }
        />
      </div>

      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("chatPlaceholder")}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none px-4 py-2.5 rounded-xl text-sm
                     bg-[var(--surface-raised)] text-[var(--text)]
                     border border-[var(--border)] placeholder:text-[var(--text-muted)]
                     focus:border-[var(--border-active)] focus:outline-none
                     focus:shadow-[0_0_0_3px_var(--accent-glow)]
                     disabled:opacity-50
                     transition-all duration-200 max-h-32"
          style={{ minHeight: "44px" }}
        />

        <motion.button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="shrink-0 size-11 rounded-xl bg-[var(--accent)] text-[#080c10]
                     flex items-center justify-center
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-all duration-200 hover:opacity-90"
        >
          <Send size={16} />
        </motion.button>
      </div>
    </div>
  );
}
