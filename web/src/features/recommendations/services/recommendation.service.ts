import { api } from "@/lib/axios";
import { RecommendationResponse } from "../types/recommendation.types";

export const recommendationService = {
  getRecommendations: async (): Promise<RecommendationResponse> => {
    const res = await api.get<RecommendationResponse>("/recommendations");
    return res.data;
  },
};
