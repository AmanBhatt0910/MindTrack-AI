export type RecommendationType =
  | "breathing"
  | "exercise"
  | "music"
  | "journal"
  | "professional"
  | "social"
  | "sleep"
  | "celebrate";

export interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  action?: string; // CTA text
  actionUrl?: string;
  icon: string; // emoji
  trigger: string;
  priority: number; // 1 = highest
}

export interface RecommendationResponse {
  recommendations: Recommendation[];
  basedOn: {
    latestEmotion: string;
    moodScore: number | null;
    timeOfDay: string;
    streakType: string | null;
  };
}

// Rule definitions
export interface RecommendationRule {
  condition: (ctx: RuleContext) => boolean;
  generate: () => Recommendation;
}

export interface RuleContext {
  latestProbabilities: Record<string, number>;
  moodScore: number | null;
  hour: number; // 0-23
  recentLabels: string[]; // last 3 days
  entryCount: number;
}
