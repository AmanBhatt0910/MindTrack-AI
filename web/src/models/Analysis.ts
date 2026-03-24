import mongoose, { Schema, models } from "mongoose";

const AnalysisSchema = new Schema(
  {
    userId: { type: String, required: true },
    text: String,
    prediction: String,
    confidence: Number,
    explanation: [String],
  },
  { timestamps: true }
);

export const Analysis =
  models.Analysis || mongoose.model("Analysis", AnalysisSchema);