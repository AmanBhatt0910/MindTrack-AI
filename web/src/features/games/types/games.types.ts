// ─── Game Types ───────────────────────────────────────────────────────────────

export type GameCategory = "breathing" | "memory" | "puzzle" | "relaxation" | "focus" | "mindfulness";

export interface GameStatistics {
  bestScore?: number;
  totalPlays: number;
  totalTimeSpent: number; // in seconds
  lastPlayed?: Date;
  achievements?: string[];
}

export interface GameSession {
  gameId: string;
  startTime: Date;
  endTime?: Date;
  score: number;
  completed: boolean;
  stats: Record<string, any>;
}

export interface MiniGame {
  id: string;
  name: string;
  description: string;
  category: GameCategory;
  difficulty: "easy" | "medium" | "hard";
  duration: string; // e.g., "5 min"
  durationSeconds: number;
  emoji: string;
  targetBenefits: string[];
  instructions: string[];
  icon: string;
  color: string; // Tailwind classes
  audio?: {
    backgroundMusic?: string;
    soundEffects?: {
      click?: string;
      success?: string;
      failure?: string;
    };
  };
}

export interface GameStats {
  userId: string;
  gameId: string;
  gamesPlayed: number;
  bestScore: number;
  totalPoints: number;
  averageScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  condition: string; // Description of how to unlock
}
