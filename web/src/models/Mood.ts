import mongoose, { Schema, models } from "mongoose";

const MoodSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    mood: { type: String, required: true },
    score: { type: Number, required: true },
    note: { type: String, default: "" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Mood = models.Mood || mongoose.model("Mood", MoodSchema);
