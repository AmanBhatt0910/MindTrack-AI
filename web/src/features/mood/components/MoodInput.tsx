"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Smile, Save } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useMoodStore, MOOD_SCORES } from "../store/useMoodStore";
import { MoodLabel } from "../types/mood.types";
import { TranslationKey } from "@/constants/translations";

const MOOD_TRANSLATION_KEYS: Record<MoodLabel, TranslationKey> = {
  Happy: "happyLabel",
  Grateful: "gratefulLabel",
  Hopeful: "hopefulLabel",
  Calm: "calmLabel",
  Exhausted: "exhaustedLabel",
  Anxious: "anxiousLabel",
  Sad: "sadLabel",
  Angry: "angryLabel",
};

const MOODS: { label: MoodLabel; emoji: string; color: string }[] = [
  { label: "Happy", emoji: "😊", color: "bg-yellow-500/15 border-yellow-500/30 text-yellow-300" },
  { label: "Grateful", emoji: "🙏", color: "bg-green-500/15 border-green-500/30 text-green-300" },
  { label: "Hopeful", emoji: "✨", color: "bg-blue-500/15 border-blue-500/30 text-blue-300" },
  { label: "Calm", emoji: "🌊", color: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300" },
  { label: "Exhausted", emoji: "😴", color: "bg-slate-500/15 border-slate-500/30 text-slate-300" },
  { label: "Anxious", emoji: "😰", color: "bg-orange-500/15 border-orange-500/30 text-orange-300" },
  { label: "Sad", emoji: "😢", color: "bg-blue-700/15 border-blue-700/30 text-blue-400" },
  { label: "Angry", emoji: "😤", color: "bg-red-500/15 border-red-500/30 text-red-300" },
];

interface MoodInputProps {
  onSaved?: () => void;
}

export default function MoodInput({ onSaved }: MoodInputProps) {
  const { t } = useTranslation();
  const { addEntry } = useMoodStore();
  const [selected, setSelected] = useState<MoodLabel | null>(null);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!selected) return;
    const score = MOOD_SCORES[selected];
    addEntry(selected, score, note);
    setSaved(true);
    setNote("");
    setSelected(null);
    setTimeout(() => {
      setSaved(false);
      onSaved?.();
    }, 1500);
  };

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5">
      <div className="flex items-center gap-2">
        <div className="size-1.5 rounded-full bg-[var(--accent)] pulse-dot" aria-hidden />
        <h2 className="text-sm font-semibold text-[var(--text)] tracking-[-0.01em]">
          {t("logMood")}
        </h2>
      </div>

      <p className="text-xs text-[var(--text-muted)]">{t("howAreYou")}</p>

      {/* Mood grid */}
      <div className="grid grid-cols-4 gap-2">
        {MOODS.map(({ label, emoji, color }) => (
          <motion.button
            key={label}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setSelected(label)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-[var(--radius-md)] border text-xs font-medium transition-all duration-200
              ${selected === label ? color : "bg-[var(--surface-raised)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-active)]"}`}
          >
            <span className="text-xl leading-none">{emoji}</span>
            <span className="text-[10px] leading-tight text-center">
              {t(MOOD_TRANSLATION_KEYS[label])}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Note */}
      <div className="space-y-1.5">
        <label className="text-xs text-[var(--text-muted)]">{t("moodNote")}</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("moodNotePlaceholder")}
          rows={3}
          className="w-full px-3 py-2.5 rounded-[var(--radius-md)] text-sm resize-none
                     bg-[var(--surface-raised)] text-[var(--text)]
                     border border-[var(--border)] placeholder:text-[var(--text-muted)]
                     focus:border-[var(--border-active)] focus:outline-none
                     focus:shadow-[0_0_0_3px_var(--accent-glow)]
                     transition-all duration-200"
        />
      </div>

      {/* Save button */}
      {saved ? (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] bg-green-500/10 border border-green-500/25 text-green-400 text-sm"
        >
          <Smile size={14} />
          {t("moodSaved")}
        </motion.div>
      ) : (
        <button
          onClick={handleSave}
          disabled={!selected}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium
                     bg-[var(--accent)] text-[#080c10] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed
                     transition-all duration-200"
        >
          <Save size={14} />
          {t("saveMood")}
        </button>
      )}
    </div>
  );
}
