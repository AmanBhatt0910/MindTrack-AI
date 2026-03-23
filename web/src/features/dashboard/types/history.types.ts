import { AnalysisResponse } from "@/features/posts/types/post.types";

export interface HistoryItem extends AnalysisResponse {
  id: string;
  text: string;
  createdAt: string;
}