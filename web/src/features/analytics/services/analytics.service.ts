import { api } from "@/lib/axios";
import { TrendsResponse, PredictionResponse, TimeRange } from "../types/analytics.types";

export const analyticsService = {
  getTrends: async (range: TimeRange = "7d"): Promise<TrendsResponse> => {
    const res = await api.get<TrendsResponse>(`/analytics/trends?range=${range}`);
    return res.data;
  },

  getPredictions: async (): Promise<PredictionResponse> => {
    const res = await api.get<PredictionResponse>("/analytics/predict");
    return res.data;
  },

  backfill: async (): Promise<{ processed: number }> => {
    const res = await api.post("/analytics/backfill");
    return res.data;
  },
};
