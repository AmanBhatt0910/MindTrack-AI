import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GamingState {
  xp: number;
  level: number;
  coins: number;
  currentStreak: number;
  bestStreak: number;
  lastLoginDate: string | null;
  unlockedAchievements: string[];
  completedChallenges: string[];
  
  // Actions
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  checkDailyLogin: () => void;
  unlockAchievement: (id: string) => void;
  completeChallenge: (id: string) => void;
  resetState: () => void;
}

const XP_PER_LEVEL = 1000;

export const useGamingStore = create<GamingState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      coins: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastLoginDate: null,
      unlockedAchievements: [],
      completedChallenges: [],

      addXP: (amount: number) => {
        set((state) => {
          const newXp = state.xp + amount;
          const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
          
          // Optionally here we could trigger an event if newLevel > state.level
          // to show a level up modal.
          
          return {
            xp: newXp,
            level: newLevel,
          };
        });
      },

      addCoins: (amount: number) => {
        set((state) => ({ coins: state.coins + amount }));
      },

      checkDailyLogin: () => {
        const today = new Date().toDateString();
        const state = get();
        
        if (state.lastLoginDate === today) {
          return; // Already logged in today
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        set((state) => {
          let newStreak = state.currentStreak;
          if (state.lastLoginDate === yesterday.toDateString()) {
            newStreak += 1;
          } else {
            newStreak = 1; // Streak broken, reset to 1
          }

          return {
            currentStreak: newStreak,
            bestStreak: Math.max(state.bestStreak, newStreak),
            lastLoginDate: today,
          };
        });
      },

      unlockAchievement: (id: string) => {
        set((state) => {
          if (state.unlockedAchievements.includes(id)) return state;
          return { unlockedAchievements: [...state.unlockedAchievements, id] };
        });
      },

      completeChallenge: (id: string) => {
        set((state) => {
          if (state.completedChallenges.includes(id)) return state;
          return { completedChallenges: [...state.completedChallenges, id] };
        });
      },

      resetState: () => {
        set({
          xp: 0,
          level: 1,
          coins: 0,
          currentStreak: 0,
          bestStreak: 0,
          lastLoginDate: null,
          unlockedAchievements: [],
          completedChallenges: [],
        });
      },
    }),
    {
      name: "gaming-storage", // local storage key
    }
  )
);
