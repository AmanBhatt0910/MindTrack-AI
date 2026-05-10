import mongoose, { Schema, models } from "mongoose";

const SOSAlertSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "resolved"],
      default: "active",
      index: true,
    },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Index for efficiently fetching active alerts for a patient
SOSAlertSchema.index({ patientId: 1, status: 1 });

export const SOSAlert =
  models.SOSAlert || mongoose.model("SOSAlert", SOSAlertSchema);
