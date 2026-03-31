"use client";

import { Phone } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function HelpBanner() {
  const { t } = useTranslation();

  return (
    <div
      className="flex items-center justify-between gap-4 px-4 py-2
                 bg-gradient-to-r from-red-500/8 via-rose-500/5 to-red-500/8
                 border-b border-red-500/15"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="size-1.5 rounded-full bg-red-400 shrink-0 animate-pulse" aria-hidden />
        <p className="text-xs text-[var(--text-secondary)] truncate">
          {t("iVandreva")}
        </p>
      </div>

      <a
        href="tel:18602662345"
        className="flex items-center gap-1.5 px-3 py-1 rounded-full
                   bg-red-500/10 text-red-400 border border-red-500/20
                   hover:bg-red-500/20 transition-colors text-xs font-semibold
                   whitespace-nowrap shrink-0"
        aria-label="Call crisis helpline 1860-2662-345"
      >
        <Phone size={11} aria-hidden />
        {t("callHelpline")}
      </a>
    </div>
  );
}
