import { MentalState, MLData } from "@/features/posts/types/post.types";

export interface HistoryItem {
  id: string;
  text: string;
  prediction: MentalState;
  confidence: number;
  explanation: string[];
  createdAt: string;
  mlData?: MLData;
}