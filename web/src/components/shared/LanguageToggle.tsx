"use client";

import { Globe } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Language } from "@/constants/translations";

const LANG_OPTIONS: { value: Language; label: string; short: string }[] = [
  { value: "en", label: "English", short: "EN" },
  { value: "hi", label: "हिन्दी", short: "HI" },
];

export default function LanguageToggle() {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="flex items-center gap-1 p-1 rounded-md bg-[var(--surface-raised)] border border-[var(--border)]">
      <Globe size={12} className="text-[var(--text-muted)] ml-1 shrink-0" aria-hidden />
      {LANG_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setLanguage(opt.value)}
          aria-label={`Switch to ${opt.label}`}
          aria-pressed={language === opt.value}
          className={`px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide transition-all duration-150
            ${
              language === opt.value
                ? "bg-[var(--accent)] text-[#080c10]"
                : "text-[var(--text-secondary)] hover:text-[var(--text)]"
            }`}
        >
          {opt.short}
        </button>
      ))}
    </div>
  );
}
