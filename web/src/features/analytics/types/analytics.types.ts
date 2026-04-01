export interface DailyEmotion {
  date: string; // YYYY-MM-DD
  anxiety: number;
  stress: number;
  depression: number;
  bipolar: number;
  overall: number; // weighted composite
  moodScore?: number;
  entryCount: number;
}

export interface MovingAverage {
  date: string;
  anxiety: number;
  stress: number;
  depression: number;
  bipolar: number;
  overall: number;
}

export interface Spike {
  date: string;
  category: string;
  previousValue: number;
  currentValue: number;
  delta: number;
}

export interface TrendSummary {
  dominantEmotion: string;
  trend: "improving" | "stable" | "declining";
  riskLevel: "low" | "moderate" | "high";
  avgMoodScore: number;
  totalEntries: number;
}

export interface TrendsResponse {
  daily: DailyEmotion[];
  movingAvg: MovingAverage[];
  spikes: Spike[];
  summary: TrendSummary;
}

export interface PredictionPoint {
  date: string;
  predicted: number;
  lower: number; // confidence interval
  upper: number;
  category: string;
}

export interface PredictionResponse {
  predictions: PredictionPoint[];
  confidence: number;
  basedOnDays: number;
}

export type TimeRange = "7d" | "30d" | "90d";
