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
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-lg p-5 sm:p-8 space-y-5 sm:space-y-8 relative overflow-hidden">
      {/* Decorative gradient background */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col items-center text-center space-y-2 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2">
          <div className="size-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
          <span className="text-xs font-bold tracking-wide uppercase">Daily Check-in</span>
        </div>
        <h2 className="text-2xl font-bold text-[var(--text)]">
          {t("howAreYou")}
        </h2>
        <p className="text-sm text-[var(--text-muted)] max-w-md">Take a deep breath. How are you feeling right now?</p>
      </div>

      {/* Mood grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 relative z-10">
        {MOODS.map(({ label, emoji, color }) => (
          <motion.button
            key={label}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelected(label)}
            className={`flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-5 rounded-2xl border-2 font-bold transition-all duration-300
              ${selected === label 
                ? `${color} shadow-lg scale-105` 
                : "bg-[var(--surface-raised)] border-transparent text-[var(--text-secondary)] hover:border-[var(--border)] hover:bg-[var(--surface-raised)]/80"}`}
          >
            <span className={`text-3xl sm:text-4xl filter transition-all duration-300 ${selected === label ? "drop-shadow-md scale-110" : "grayscale opacity-70"}`}>{emoji}</span>
            <span className="text-xs sm:text-sm tracking-wide">
              {t(MOOD_TRANSLATION_KEYS[label])}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Note */}
      <div className="space-y-2 sm:space-y-3 relative z-10 bg-[var(--surface-raised)]/30 p-4 sm:p-5 rounded-2xl border border-[var(--border)]">
        <label className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
          Add a note <span className="text-xs font-medium text-[var(--text-muted)] font-normal">(Optional)</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("moodNotePlaceholder")}
          rows={2}
          className="w-full px-4 py-3 rounded-xl text-base resize-none
                     bg-[var(--bg)] text-[var(--text)]
                     border border-[var(--border)] placeholder:text-[var(--text-muted)]
                     focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20
                     transition-all duration-200 shadow-inner"
        />
      </div>

      {/* Save button */}
      <div className="relative z-10 pt-2">
        {saved ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-500/30"
          >
            <Smile size={20} />
            {t("moodSaved")}
          </motion.div>
        ) : (
          <button
            onClick={handleSave}
            disabled={!selected}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-bold
                       bg-[var(--text)] text-[var(--bg)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200 shadow-md"
          >
            <Save size={18} />
            {t("saveMood")}
          </button>
        )}
      </div>
    </div>
  );
}
