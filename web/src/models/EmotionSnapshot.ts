import mongoose, { Schema, models } from "mongoose";

const EmotionSnapshotSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true },
    sentimentScores: {
      anxiety: { type: Number, default: 0 },
      stress: { type: Number, default: 0 },
      depression: { type: Number, default: 0 },
      bipolar: { type: Number, default: 0 },
      overall: { type: Number, default: 0 },
    },
    moodScore: { type: Number, default: null },
    moodLabel: { type: String, default: null },
    entryCount: { type: Number, default: 1 },
    source: {
      type: String,
      enum: ["analysis", "mood", "combined"],
      default: "analysis",
    },
  },
  { timestamps: true }
);

// Compound index for efficient user+date queries
EmotionSnapshotSchema.index({ userId: 1, date: -1 });

export const EmotionSnapshot =
  models.EmotionSnapshot ||
  mongoose.model("EmotionSnapshot", EmotionSnapshotSchema);
