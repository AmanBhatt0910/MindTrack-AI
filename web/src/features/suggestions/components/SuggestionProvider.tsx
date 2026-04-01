"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useSuggestionEngine } from "../hooks/useSuggestionEngine";
import { useTranslation } from "@/hooks/useTranslation";

export default function SuggestionProvider() {
  const { currentSuggestion, dismiss, dismissForToday } = useSuggestionEngine();
  const { t } = useTranslation();

  useEffect(() => {
    if (currentSuggestion) {
      toast(
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentSuggestion.emoji}</span>
            <p className="text-sm font-medium">{currentSuggestion.message}</p>
          </div>
          <button
            onClick={() => {
              dismissForToday();
              toast.dismiss();
            }}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition"
          >
            {t("dontShowToday")}
          </button>
        </div>,
        {
          duration: 8000,
          position: "bottom-left",
          onDismiss: dismiss,
          className: "bg-[var(--surface)] border-[var(--border)]",
        }
      );
    }
  }, [currentSuggestion, dismiss, dismissForToday, t]);

  return null; // Provider renders nothing — uses sonner toasts
}
