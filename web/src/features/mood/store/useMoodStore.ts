import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MoodEntry, MoodLabel } from "../types/mood.types";

interface MoodStore {
  entries: MoodEntry[];
  addEntry: (mood: MoodLabel, score: number, note: string) => void;
  deleteEntry: (id: string) => void;
}

const MOOD_SCORES: Record<MoodLabel, number> = {
  Happy: 9,
  Grateful: 8,
  Hopeful: 7,
  Calm: 6,
  Exhausted: 4,
  Anxious: 3,
  Sad: 2,
  Angry: 2,
};

export const useMoodStore = create<MoodStore>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (mood, score, note) => {
        const entry: MoodEntry = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          mood,
          score,
          note,
        };
        set((state) => ({ entries: [entry, ...state.entries] }));
      },
      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        }));
      },
    }),
    { name: "mindtrack-mood-store" }
  )
);

export { MOOD_SCORES };
