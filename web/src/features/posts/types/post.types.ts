export type MentalState =
  | "Depression"
  | "Anxiety"
  | "Stress"
  | "Neutral";

export interface AnalysisResponse {
  prediction: MentalState;
  confidence: number;
  explanation: string[];
}