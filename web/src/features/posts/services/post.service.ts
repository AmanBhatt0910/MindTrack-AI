import { api } from "@/lib/axios";
import { AnalysisResponse } from "../types/post.types";

export const postService = {
  analyze: async (
    text: string,
    language: string
  ): Promise<AnalysisResponse> => {
    const res = await api.post("/analysis", { text, language });
    return res.data;
  },
  
  getHistory: async (): Promise<AnalysisResponse[]> => {
    const res = await api.get("/analysis");
    return res.data;
  },
};