import mongoose, { Schema, models } from "mongoose";

const AnalysisSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    text: { type: String, required: true },
    language: { type: String, default: "en" },
    prediction: { type: String, required: true },
    confidence: { type: Number, required: true },
    explanation: { type: [String], default: [] },
    mlData: {
      label: String,
      confidence: Number,
      probabilities: {
        type: Map,
        of: Number,
      },
      allPredictions: [{
        label: String,
        confidence: Number,
      }],
      rawProbs: [Number],
    },
  },
  { timestamps: true }
);

export const Analysis = models.Analysis || mongoose.model("Analysis", AnalysisSchema);