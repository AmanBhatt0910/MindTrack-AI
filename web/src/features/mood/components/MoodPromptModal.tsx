"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smile } from "lucide-react";
import { useMoodStore } from "../store/useMoodStore";
import { useAuthStore } from "@/store/useAuthStore";
import MoodInput from "./MoodInput";

export default function MoodPromptModal() {
  const { entries } = useMoodStore();
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Only run once on mount
    if (hasChecked || !user || user.role !== "patient") return;

    const checkMoodStatus = () => {
      const today = new Date().toISOString().split("T")[0];
      const hasLoggedToday = entries.some((entry) => entry.date.startsWith(today));
      
      const hasSkippedToday = sessionStorage.getItem("skippedMoodPrompt") === today;

      if (!hasLoggedToday && !hasSkippedToday) {
        // Add a small delay so it doesn't pop up instantly on load
        setTimeout(() => setIsOpen(true), 1500);
      }
      setHasChecked(true);
    };

    checkMoodStatus();
  }, [entries, hasChecked, user]);

  const handleClose = () => {
    setIsOpen(false);
    const today = new Date().toISOString().split("T")[0];
    sessionStorage.setItem("skippedMoodPrompt", today);
  };

  const handleSaved = () => {
    setTimeout(() => {
      setIsOpen(false);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-transparent z-10"
          >
            <button
              onClick={handleClose}
              className="absolute -top-3 -right-3 z-20 p-2 bg-[var(--surface-raised)] rounded-full text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)] shadow-md transition-colors"
            >
              <X size={20} />
            </button>
            <MoodInput onSaved={handleSaved} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
