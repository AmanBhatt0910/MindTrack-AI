import { create } from "zustand";
import { MoodEntry, MoodLabel } from "../types/mood.types";
import { api } from "@/lib/axios";

interface MoodStore {
  entries: MoodEntry[];
  loading: boolean;
  fetchEntries: () => Promise<void>;
  addEntry: (mood: MoodLabel, score: number, note: string) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
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

export const useMoodStore = create<MoodStore>()((set, get) => ({
  entries: [],
  loading: false,
  fetchEntries: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/mood");
      set({ entries: res.data });
    } catch (err) {
      console.error("Failed to fetch moods", err);
    } finally {
      set({ loading: false });
    }
  },
  addEntry: async (mood, score, note) => {
    try {
      const res = await api.post("/mood", { mood, score, note });
      set((state) => ({ entries: [res.data, ...state.entries] }));
    } catch (err) {
      console.error("Failed to save mood", err);
    }
  },
  deleteEntry: async (id) => {
    // Optional: implement backend delete if needed
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
    }));
  },
}));

export { MOOD_SCORES };
