export type ReminderFrequency = "daily" | "weekly" | "monthly" | "one-time";

export interface Reminder {
  id: string;
  title: string;
  description: string;
  frequency: ReminderFrequency;
  time: string; // HH:MM
  createdAt: string;
  completed: boolean;
  nextDue: string; // ISO string
}
