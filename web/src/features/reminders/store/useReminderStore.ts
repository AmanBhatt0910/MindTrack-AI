import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Reminder, ReminderFrequency } from "../types/reminder.types";

interface ReminderStore {
  reminders: Reminder[];
  addReminder: (title: string, description: string, frequency: ReminderFrequency, time: string) => void;
  deleteReminder: (id: string) => void;
  toggleComplete: (id: string) => void;
}

function computeNextDue(frequency: ReminderFrequency, time: string): string {
  const now = new Date();
  const [hours, minutes] = time.split(":").map(Number);
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);

  if (next <= now) {
    if (frequency === "daily") next.setDate(next.getDate() + 1);
    else if (frequency === "weekly") next.setDate(next.getDate() + 7);
    else if (frequency === "monthly") next.setMonth(next.getMonth() + 1);
    else next.setDate(next.getDate() + 1);
  }

  return next.toISOString();
}

export const useReminderStore = create<ReminderStore>()(
  persist(
    (set) => ({
      reminders: [],
      addReminder: (title, description, frequency, time) => {
        const reminder: Reminder = {
          id: Date.now().toString(),
          title,
          description,
          frequency,
          time,
          createdAt: new Date().toISOString(),
          completed: false,
          nextDue: computeNextDue(frequency, time),
        };
        set((state) => ({ reminders: [reminder, ...state.reminders] }));
      },
      deleteReminder: (id) => {
        set((state) => ({
          reminders: state.reminders.filter((r) => r.id !== id),
        }));
      },
      toggleComplete: (id) => {
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, completed: !r.completed } : r
          ),
        }));
      },
    }),
    { name: "mindtrack-reminders-store" }
  )
);
