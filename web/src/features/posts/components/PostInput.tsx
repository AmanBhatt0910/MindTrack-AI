"use client";

import { ANALYZER_COPY } from "@/constants/dashboard";
import { clsx } from "clsx";

interface PostInputProps {
  value: string;
  onChange: (val: string) => void;
}

export default function PostInput({ value, onChange }: PostInputProps) {
  const remaining = ANALYZER_COPY.maxChars - value.length;
  const isNearLimit = remaining < 100;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Post text
      </label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, ANALYZER_COPY.maxChars))}
        placeholder={ANALYZER_COPY.placeholder}
        rows={7}
        className={clsx(
          "w-full resize-none rounded-[var(--radius-md)] p-4 text-sm leading-relaxed",
          "bg-[var(--surface-raised)] text-[var(--text)]",
          "border transition-all duration-200 outline-none",
          "placeholder:text-[var(--text-muted)]",
          "focus:border-[var(--border-active)] focus:shadow-[0_0_0_3px_var(--accent-glow)]",
          "border-[var(--border)]"
        )}
      />

      {/* Character counter */}
      <div className="flex justify-end">
        <span
          className={clsx(
            "text-[11px] tabular-nums",
            isNearLimit ? "text-amber-400" : "text-[var(--text-muted)]"
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {remaining} / {ANALYZER_COPY.maxChars}
        </span>
      </div>
    </div>
  );
}