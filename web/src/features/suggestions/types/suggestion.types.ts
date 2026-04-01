export interface Suggestion {
  id: string;
  message: string;
  emoji: string;
  type: "breathing" | "break" | "sleep" | "hydration" | "movement" | "mindfulness";
  priority: number;
  dismissedUntil?: string; // ISO date — "don't show again today"
}

export interface SuggestionTrigger {
  id: string;
  name: string;
  check: (ctx: SuggestionContext) => boolean;
  suggestion: Omit<Suggestion, "id">;
}

export interface SuggestionContext {
  latestStressScore: number;
  latestAnxietyScore: number;
  negativeStreak: number; // consecutive negative entries
  currentHour: number;
  sessionDurationMinutes: number;
  lastSuggestionTime: string | null;
}

export interface SuggestionsResponse {
  suggestions: Suggestion[];
  context: {
    stressLevel: number;
    streak: number;
    timeOfDay: string;
  };
}
