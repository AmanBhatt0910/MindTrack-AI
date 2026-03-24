export type MentalState = "Depression" | "Anxiety" | "Neutral" | "Bipolar" | "Stress";

export interface AnalysisResponse {
  prediction: MentalState;
  confidence: number;
  explanation: string[];
}