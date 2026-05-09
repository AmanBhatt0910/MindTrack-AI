import mongoose, { Schema, models } from "mongoose";

const PatientDoctorSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "revoked"],
      default: "pending",
      index: true,
    },
    assignedAt: { type: Date, default: Date.now },
    consentGiven: { type: Boolean, default: false },
    consentDate: { type: Date, default: null },
  },
  { timestamps: true }
);

// Prevent duplicate assignments
PatientDoctorSchema.index({ patientId: 1, doctorId: 1 }, { unique: true });

// Efficient lookup for doctor's active patients
PatientDoctorSchema.index({ doctorId: 1, status: 1 });

export const PatientDoctor =
  models.PatientDoctor ||
  mongoose.model("PatientDoctor", PatientDoctorSchema);
