import mongoose, { Schema, models } from "mongoose";

const SessionNoteSchema = new Schema(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionDate: { type: Date, required: true },
    noteContent: { type: String, required: true }, // encrypted at app level
    moodAtSession: {
      type: String,
      enum: ["very_low", "low", "neutral", "good", "excellent"],
      default: "neutral",
    },
    riskAssessment: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },
    primaryConcerns: { type: [String], default: [] },
    followUpRequired: { type: Boolean, default: false },
    nextSessionDate: { type: Date, default: null },
  },
  { timestamps: true }
);

SessionNoteSchema.index({ doctorId: 1, patientId: 1, sessionDate: -1 });

export const SessionNote =
  models.SessionNote || mongoose.model("SessionNote", SessionNoteSchema);
