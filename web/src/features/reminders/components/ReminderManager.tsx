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
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-[var(--accent)]" />
          <h3 className="text-sm font-semibold text-[var(--text)]">{t("smartSuggestions")}</h3>
          <span className="text-xs text-[var(--text-muted)]">— {t("basedOnHistory")}</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {SMART_SUGGESTIONS.map((s) => (
            <div
              key={s.titleKey}
              className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] bg-[var(--surface-raised)] border border-[var(--border)]"
            >
              <span className="text-2xl shrink-0">{s.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text)]">
                  {t(s.titleKey as TranslationKey)}
                </p>
                <p className="text-xs text-[var(--text-muted)] truncate">
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
                className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-[var(--radius-sm)] text-xs
                           bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--border-active)]
                           hover:opacity-80 transition-all"
              >
                <Plus size={11} />
                {t("add")}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add reminder button / form */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-[var(--accent)] pulse-dot" aria-hidden />
            <h3 className="text-sm font-semibold text-[var(--text)]">{t("addReminder")}</h3>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium
                       bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--border-active)]
                       hover:opacity-80 transition-all"
          >
            <Plus size={12} />
            {t("addReminder")}
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 overflow-hidden"
            >
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--text-muted)]">{t("reminderTitle")}</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Take medication"
                  className="w-full h-9 px-3 rounded-[var(--radius-md)] text-sm
                             bg-[var(--surface-raised)] text-[var(--text)]
                             border border-[var(--border)] placeholder:text-[var(--text-muted)]
                             focus:border-[var(--border-active)] focus:outline-none
                             focus:shadow-[0_0_0_3px_var(--accent-glow)] transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--text-muted)]">{t("reminderDesc")}</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional details…"
                  className="w-full h-9 px-3 rounded-[var(--radius-md)] text-sm
                             bg-[var(--surface-raised)] text-[var(--text)]
                             border border-[var(--border)] placeholder:text-[var(--text-muted)]
                             focus:border-[var(--border-active)] focus:outline-none
                             focus:shadow-[0_0_0_3px_var(--accent-glow)] transition-all"
                />
              </div>

              {/* Frequency & time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-[var(--text-muted)]">{t("reminderFrequency")}</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as ReminderFrequency)}
                    className="w-full h-9 px-3 rounded-[var(--radius-md)] text-sm
                               bg-[var(--surface-raised)] text-[var(--text)]
                               border border-[var(--border)]
                               focus:border-[var(--border-active)] focus:outline-none
                               transition-all"
                  >
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {t(opt.labelKey as TranslationKey)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[var(--text-muted)]">{t("reminderTime")}</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full h-9 px-3 rounded-[var(--radius-md)] text-sm
                               bg-[var(--surface-raised)] text-[var(--text)]
                               border border-[var(--border)]
                               focus:border-[var(--border-active)] focus:outline-none
                               transition-all"
                  />
                </div>
              </div>

              {saved ? (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] bg-green-500/10 border border-green-500/25 text-green-400 text-sm">
                  <CheckCircle size={14} />
                  {t("reminderAdded")}
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleAdd}
                    disabled={!title.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium
                               bg-[var(--accent)] text-[#080c10] hover:opacity-90 disabled:opacity-40 transition-all"
                  >
                    <Bell size={14} />
                    {t("addReminder")}
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2.5 rounded-[var(--radius-md)] text-sm text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--surface-raised)] transition-all"
                  >
                    {t("cancel")}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Upcoming reminders */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border)] flex items-center gap-2">
          <Clock size={13} className="text-[var(--accent)]" />
          <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            {t("upcomingReminders")} ({upcoming.length})
          </h3>
        </div>

        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
            <Bell size={20} className="text-[var(--text-muted)]" />
            <p className="text-sm text-[var(--text-muted)]">{t("noReminders")}</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {upcoming.map((reminder) => (
              <motion.div
                key={reminder.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 px-5 py-3.5"
              >
                <button
                  onClick={() => toggleComplete(reminder.id)}
                  className="shrink-0 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                >
                  <Circle size={16} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text)]">{reminder.title}</p>
                  {reminder.description && (
                    <p className="text-xs text-[var(--text-muted)] truncate">{reminder.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Repeat size={10} className="text-[var(--text-muted)]" />
                    <span className="text-[11px] text-[var(--text-muted)] capitalize">{reminder.frequency}</span>
                    <span className="text-[11px] text-[var(--accent)]">
                      {formatNextDue(reminder.nextDue)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteReminder(reminder.id)}
                  className="shrink-0 p-1.5 rounded-md text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all"
                  aria-label="Delete reminder"
                >
                  <Trash2 size={13} />
                </button>
              </motion.div>
            ))}
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
