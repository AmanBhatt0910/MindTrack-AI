import mongoose, { Schema, models } from "mongoose";

const NotificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "crisis_alert",
        "new_patient",
        "message",
        "session_reminder",
        "risk_change",
        "consent_granted",
        "consent_revoked",
      ],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, default: "" },
    read: { type: Boolean, default: false, index: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Efficient query: unread notifications for a user, newest first
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification =
  models.Notification ||
  mongoose.model("Notification", NotificationSchema);
