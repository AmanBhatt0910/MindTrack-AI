import { AnalysisResponse } from "../types/post.types";

export const postService = {
  analyze: async (text: string, language: string): Promise<AnalysisResponse> => {
    await new Promise((res) => setTimeout(res, 1200));

    // Dummy logic
    if (text.toLowerCase().includes("sad")) {
      return {
        prediction: "Depression",
        confidence: 0.87,
        explanation: [
          "Detected negative sentiment",
          "Use of emotionally heavy words like 'sad'",
          "Low energy tone in sentence structure",
        ],
      };
    }

    return {
      prediction: "Neutral",
      confidence: 0.65,
      explanation: [
        "No strong emotional indicators",
        "Balanced sentence tone",
      ],
    };
  },
};