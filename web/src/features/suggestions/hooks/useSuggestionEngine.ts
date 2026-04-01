"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";

interface SuggestionData {
  id: string;
  message: string;
  emoji: string;
  type: string;
}

interface UseSuggestionReturn {
  currentSuggestion: SuggestionData | null;
  dismiss: () => void;
  dismissForToday: () => void;
}

const POLL_INTERVAL = 30000; // 30 seconds
const STORAGE_KEY = "mindtrack-suggestions-dismissed";

export function useSuggestionEngine(): UseSuggestionReturn {
  const { user } = useAuthStore();
  const [currentSuggestion, setCurrentSuggestion] = useState<SuggestionData | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastShownRef = useRef<string | null>(null);

  const isDismissedToday = useCallback((id: string): boolean => {
    if (typeof window === "undefined") return false;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return false;
      const data = JSON.parse(stored);
      const today = new Date().toISOString().split("T")[0];
      return data[id] === today;
    } catch {
      return false;
    }
  }, []);

  const fetchSuggestions = useCallback(async () => {
    if (!user) return;

    try {
      const res = await api.get("/suggestions");
      const { suggestions } = res.data;

      if (suggestions && suggestions.length > 0) {
        // Find first non-dismissed suggestion
        const available = suggestions.find(
          (s: SuggestionData) => !isDismissedToday(s.id) && s.id !== lastShownRef.current
        );

        if (available) {
          setCurrentSuggestion(available);
          lastShownRef.current = available.id;
        }
      }
    } catch {
      // Silent fail — suggestions are non-critical
    }
  }, [user, isDismissedToday]);

  useEffect(() => {
    if (!user) return;

    // Initial fetch after 10 seconds
    const timeout = setTimeout(fetchSuggestions, 10000);

    // Periodic polling
    intervalRef.current = setInterval(fetchSuggestions, POLL_INTERVAL);

    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, fetchSuggestions]);

  const dismiss = useCallback(() => {
    setCurrentSuggestion(null);
  }, []);

  const dismissForToday = useCallback(() => {
    if (!currentSuggestion) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const data = stored ? JSON.parse(stored) : {};
      data[currentSuggestion.id] = new Date().toISOString().split("T")[0];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Silent
    }
    setCurrentSuggestion(null);
  }, [currentSuggestion]);

  return { currentSuggestion, dismiss, dismissForToday };
}
