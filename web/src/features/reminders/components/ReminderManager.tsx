"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Trash2, CheckCircle, Circle, Plus, Sparkles, Clock, Repeat } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { TranslationKey } from "@/constants/translations";
import { useReminderStore } from "../store/useReminderStore";
import { ReminderFrequency } from "../types/reminder.types";

const FREQUENCY_OPTIONS: { value: ReminderFrequency; labelKey: string }[] = [
  { value: "daily", labelKey: "daily" },
  { value: "weekly", labelKey: "weekly" },
  { value: "monthly", labelKey: "monthly" },
  { value: "one-time", labelKey: "oneTime" },
];

const SMART_SUGGESTIONS = [
  {
    titleKey: "checkIn",
    descKey: "checkInDesc",
    frequency: "daily" as ReminderFrequency,
    time: "09:00",
    emoji: "🧘",
  },
  {
    titleKey: "therapyReminder",
    descKey: "therapyReminderDesc",
    frequency: "weekly" as ReminderFrequency,
    time: "10:00",
    emoji: "💬",
  },
];

function formatNextDue(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffMinutes = Math.floor((diffMs % 3600000) / 60000);

  if (diffHours < 1) return `in ${diffMinutes}m`;
  if (diffHours < 24) return `in ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "tomorrow";
  return `in ${diffDays} days`;
}

export default function ReminderManager() {
  const { t } = useTranslation();
  const { reminders, addReminder, deleteReminder, toggleComplete } = useReminderStore();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<ReminderFrequency>("daily");
  const [time, setTime] = useState("09:00");
  const [saved, setSaved] = useState(false);

  const handleAdd = () => {
    if (!title.trim()) return;
    addReminder(title, description, frequency, time);
    setTitle("");
    setDescription("");
    setFrequency("daily");
    setTime("09:00");
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setShowForm(false);
    }, 1200);
  };

  const upcoming = reminders.filter((r) => !r.completed);
  const completed = reminders.filter((r) => r.completed);

  return (
    <div className="space-y-6">
      {/* Smart suggestions */}
      <div className="rounded-[var(--radius-lg)] border border-transparent bg-gradient-to-br from-indigo-500/10 to-purple-500/5 p-6 space-y-4 shadow-sm relative overflow-hidden">
        <div className="absolute -top-10 -right-10 text-indigo-500/10 rotate-12">
          <Sparkles size={120} />
        </div>
        <div className="relative z-10 flex items-center gap-2">
          <Sparkles size={18} className="text-indigo-500" />
          <h3 className="text-base font-bold text-indigo-900 dark:text-indigo-200">{t("smartSuggestions")}</h3>
          <span className="text-xs font-medium text-indigo-600/70 dark:text-indigo-400/70 bg-indigo-500/10 px-2 py-0.5 rounded-full">— {t("basedOnHistory")}</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 relative z-10">
          {SMART_SUGGESTIONS.map((s) => (
            <div
              key={s.titleKey}
              className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--surface)]/80 backdrop-blur-md border border-white/20 dark:border-white/5 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--surface-raised)] flex items-center justify-center text-2xl shrink-0 shadow-sm transform group-hover:scale-110 transition-transform">
                {s.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--text)]">
                  {t(s.titleKey as TranslationKey)}
                </p>
                <p className="text-xs font-medium text-[var(--text-muted)] truncate mt-0.5">
                  {t(s.descKey as TranslationKey)}
                </p>
              </div>
              <button
                onClick={() => addReminder(
                  t(s.titleKey as TranslationKey),
                  t(s.descKey as TranslationKey),
                  s.frequency,
                  s.time
                )}
                className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:bg-indigo-500/20 dark:text-indigo-300 dark:hover:bg-indigo-500 dark:hover:text-white transition-all shadow-sm"
                title="Add Reminder"
              >
                <Plus size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add reminder button / form */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text)]">{t("addReminder")}</h3>
              <p className="text-xs text-[var(--text-muted)] font-medium">Create a new custom schedule</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
              showForm 
                ? "bg-[var(--surface-raised)] text-[var(--text-muted)] hover:bg-[var(--border)]" 
                : "bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg"
            }`}
          >
            {showForm ? "Close" : <><Plus size={16} /> New Reminder</>}
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden pt-4 border-t border-[var(--border)]"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{t("reminderTitle")}</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Drink water"
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium
                               bg-[var(--bg)] text-[var(--text)]
                               border border-[var(--border)] placeholder:text-[var(--text-muted)]
                               focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{t("reminderDesc")}</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional details…"
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium
                               bg-[var(--bg)] text-[var(--text)]
                               border border-[var(--border)] placeholder:text-[var(--text-muted)]
                               focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Frequency & time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{t("reminderFrequency")}</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as ReminderFrequency)}
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium
                               bg-[var(--bg)] text-[var(--text)]
                               border border-[var(--border)]
                               focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
                  >
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {t(opt.labelKey as TranslationKey)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{t("reminderTime")}</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium
                               bg-[var(--bg)] text-[var(--text)]
                               border border-[var(--border)]
                               focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="pt-2">
                {saved ? (
                  <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-500/10 border border-green-500/25 text-green-500 font-bold text-sm">
                    <CheckCircle size={18} />
                    {t("reminderAdded")}
                  </div>
                ) : (
                  <button
                    onClick={handleAdd}
                    disabled={!title.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold
                               bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 transition-all shadow-md active:scale-[0.98]"
                  >
                    <Bell size={16} />
                    {t("addReminder")}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Upcoming reminders */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-raised)]/50">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-blue-500" />
            <h3 className="text-sm font-bold text-[var(--text)] tracking-wide">
              {t("upcomingReminders")}
            </h3>
          </div>
          <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {upcoming.length}
          </span>
        </div>

        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--surface-raised)] flex items-center justify-center">
              <Bell size={28} className="text-[var(--text-muted)] opacity-50" />
            </div>
            <p className="text-base font-medium text-[var(--text-muted)]">{t("noReminders")}</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            <AnimatePresence>
              {upcoming.map((reminder) => (
                <motion.div
                  key={reminder.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-4 px-6 py-4 group hover:bg-[var(--surface-raised)] transition-colors"
                >
                  <button
                    onClick={() => toggleComplete(reminder.id)}
                    className="shrink-0 w-6 h-6 rounded-full border-2 border-[var(--text-muted)] flex items-center justify-center text-transparent hover:border-blue-500 hover:text-blue-500 transition-all group-hover:border-blue-400"
                  >
                    <CheckCircle size={16} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-[var(--text)] leading-tight mb-1">{reminder.title}</p>
                    {reminder.description && (
                      <p className="text-sm text-[var(--text-muted)] truncate mb-1.5">{reminder.description}</p>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--surface-raised)] text-xs font-semibold text-[var(--text-secondary)] capitalize">
                        <Repeat size={12} />
                        {reminder.frequency}
                      </span>
                      <span className="text-xs font-bold text-blue-500 flex items-center gap-1">
                        <Clock size={12} />
                        {formatNextDue(reminder.nextDue)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Delete reminder"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Completed reminders */}
      {completed.length > 0 && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden opacity-70">
          <div className="px-5 py-3 border-b border-[var(--border)] flex items-center gap-2">
            <CheckCircle size={13} className="text-green-400" />
            <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              {t("pastReminders")} ({completed.length})
            </h3>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {completed.map((reminder) => (
              <div key={reminder.id} className="flex items-center gap-3 px-5 py-3.5">
                <button
                  onClick={() => toggleComplete(reminder.id)}
                  className="shrink-0 text-green-400 hover:text-[var(--text-muted)] transition-colors"
                >
                  <CheckCircle size={16} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-muted)] line-through">{reminder.title}</p>
                </div>
                <button
                  onClick={() => deleteReminder(reminder.id)}
                  className="shrink-0 p-1.5 rounded-md text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
