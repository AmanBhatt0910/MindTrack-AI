export type MentalState = "Depression" | "Anxiety" | "Neutral" | "Bipolar" | "Stress";

export interface Prediction {
  label: string;
  confidence: number;
}

export interface MLData {
  label: string;
  confidence: number;
  probabilities?: Record<string, number>;
  allPredictions?: Prediction[];
  rawProbs?: number[];
}

export interface AnalysisResponse {
  _id?: string;
  text?: string;
  prediction: MentalState;
  confidence: number;
  explanation: string[];
  mlData?: MLData;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  language?: string;
}

export interface AnalysisDocument extends AnalysisResponse {
  _id: string;
  userId: string;
  text: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}