import mongoose, { Schema, models } from "mongoose";

const RecommendationSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: [
        "breathing",
        "exercise",
        "music",
        "journal",
        "professional",
        "social",
        "sleep",
        "celebrate",
      ],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    trigger: { type: String, required: true },
    dismissed: { type: Boolean, default: false },
    interacted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

RecommendationSchema.index({ userId: 1, createdAt: -1 });

export const Recommendation =
  models.Recommendation ||
  mongoose.model("Recommendation", RecommendationSchema);
