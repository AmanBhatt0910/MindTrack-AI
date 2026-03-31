export type MoodLabel =
  | "Happy"
  | "Sad"
  | "Anxious"
  | "Calm"
  | "Angry"
  | "Hopeful"
  | "Exhausted"
  | "Grateful";

export interface MoodEntry {
  id: string;
  date: string; // ISO string
  mood: MoodLabel;
  score: number; // 1-10
  note: string;
}
