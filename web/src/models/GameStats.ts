import mongoose, { Schema, models } from "mongoose";

// ─── Game Stats Schema ─────────────────────────────────────────────────────────

const GameStatsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    gameId: {
      type: String,
      required: true,
      index: true,
    },
    gameName: String,
    category: String,
    gamesPlayed: {
      type: Number,
      default: 0,
    },
    totalTimeSpent: {
      type: Number,
      default: 0, // in seconds
    },
    bestScore: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    lastPlayed: Date,
    achievements: [String], // Array of achievement IDs
    sessionHistory: [
      {
        playedAt: Date,
        score: Number,
        timeSpent: Number, // seconds
        completed: Boolean,
      },
    ],
  },
  { timestamps: true }
);

// ─── Game Session Schema ──────────────────────────────────────────────────────

const GameSessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    gameId: {
      type: String,
      required: true,
    },
    gameName: String,
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: Date,
    score: Number,
    completed: {
      type: Boolean,
      default: false,
    },
    timeSpent: Number, // in seconds
    stats: Schema.Types.Mixed, // Flexible object for game-specific stats
  },
  { timestamps: true }
);

// ─── User Achievement Schema ───────────────────────────────────────────────────

const UserAchievementSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    achievementId: {
      type: String,
      required: true,
    },
    achievementName: String,
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
    progress: Number, // percentage
  },
  { timestamps: true }
);

// ─── Models ───────────────────────────────────────────────────────────────────

if (models.GameStats) {
  delete models.GameStats;
}
if (models.GameSession) {
  delete models.GameSession;
}
if (models.UserAchievement) {
  delete models.UserAchievement;
}

export const GameStats = mongoose.model("GameStats", GameStatsSchema);
export const GameSession = mongoose.model("GameSession", GameSessionSchema);
export const UserAchievement = mongoose.model(
  "UserAchievement",
  UserAchievementSchema
);
