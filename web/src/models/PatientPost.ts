import mongoose, { Schema, models } from "mongoose";

const PatientPostSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    content: { type: String, required: true, maxlength: 5000 },
    allowDoctorAnalysis: { type: Boolean, default: false },
    analyzed: { type: Boolean, default: false },
    analysisId: { type: Schema.Types.ObjectId, ref: "Analysis" },
  },
  { timestamps: true }
);

PatientPostSchema.index({ userId: 1, createdAt: -1 });

export const PatientPost =
  models.PatientPost || mongoose.model("PatientPost", PatientPostSchema);
