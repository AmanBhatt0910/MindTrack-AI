"use client";

import { Globe } from "lucide-react";
import { LANGUAGES } from "@/constants/dashboard";

interface LanguageSelectProps {
  value: string;
  onChange: (val: string) => void;
}

export default function LanguageSelect({ value, onChange }: LanguageSelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Language
      </label>

      <div className="relative">
        {/* Globe icon */}
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
          aria-hidden
        >
          <Globe size={14} />
        </span>

        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 pl-9 pr-4 rounded-[var(--radius-md)] text-sm
                     bg-[var(--surface-raised)] text-[var(--text)]
                     border border-[var(--border)]
                     hover:border-[var(--border-active)]
                     focus:border-[var(--border-active)] focus:outline-none
                     focus:shadow-[0_0_0_3px_var(--accent-glow)]
                     transition-all duration-200 cursor-pointer appearance-none"
        >
          {LANGUAGES.map(({ value: val, label }) => (
            <option key={val} value={val} style={{ background: "var(--surface-raised)" }}>
              {label}
            </option>
          ))}
        </select>

        {/* Chevron */}
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
          aria-hidden
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </div>
    </div>
  );
}