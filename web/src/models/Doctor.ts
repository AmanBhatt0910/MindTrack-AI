import mongoose, { Schema, models } from "mongoose";

const DoctorSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    licenseNumber: { type: String, default: "" },
    specializations: { type: [String], default: [] },
    credentials: { type: String, default: "" },
    bio: { type: String, default: "" },
    clinicName: { type: String, default: "" },
    clinicAddress: { type: String, default: "" },
    phone: { type: String, default: "" },
    verified: { type: Boolean, default: true }, // MVP: auto-verified
    verifiedAt: { type: Date, default: null },
    activePatientCount: { type: Number, default: 0 },
    maxPatients: { type: Number, default: 50 },
  },
  { timestamps: true }
);

export const Doctor = models.Doctor || mongoose.model("Doctor", DoctorSchema);
