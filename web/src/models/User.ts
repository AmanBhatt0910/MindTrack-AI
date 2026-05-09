import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
      index: true,
    },
    apiKey: { type: String, unique: true, sparse: true },
    notificationPrefs: {
      high_risk: { type: Boolean, default: true },
      weekly_digest: { type: Boolean, default: true },
      model_updates: { type: Boolean, default: true },
    },
    gamingStats: {
      xp: { type: Number, default: 0 },
      level: { type: Number, default: 1 },
      coins: { type: Number, default: 0 },
    },
    streakInfo: {
      currentStreak: { type: Number, default: 0 },
      bestStreak: { type: Number, default: 0 },
      lastLoginDate: { type: Date },
    },
    unlockedThemes: { type: [String], default: ["default"] },
  },
  { timestamps: true }
);

if (models.User) {
  delete models.User;
}

export const User = mongoose.model("User", UserSchema);