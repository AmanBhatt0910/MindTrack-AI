import mongoose, { Schema, Document, Model } from "mongoose";
import type { Therapist, AvailabilitySlot } from "@/types/therapist.types";

export interface TherapistDocument
  extends Omit<Therapist, "id">,
    Document {}

const AvailabilitySlotSchema = new Schema<AvailabilitySlot>(
  {
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const CoordinatesSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const TherapistSchema = new Schema<TherapistDocument>(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true },
    specializations: { type: [String], required: true, index: true },
    credentials: { type: String, default: "" },
    languages: { type: [String], default: ["English"] },
    experience: { type: String, default: "" },
    bio: { type: String, default: "" },
    avatar: { type: String, default: "" },

    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    clinicName: { type: String, default: "" },
    clinicAddress: { type: String, required: true },
    city: { type: String, required: true, index: true },
    coordinates: { type: CoordinatesSchema, required: true },

    available: { type: Boolean, default: false },
    nextAvailable: { type: String, default: "" },
    availabilitySlots: { type: [AvailabilitySlotSchema], default: [] },
    fee: { type: String, default: "" },

    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// 2dsphere index for future geospatial queries
TherapistSchema.index({ coordinates: "2dsphere" });

export const TherapistModel: Model<TherapistDocument> =
  mongoose.models.Therapist ??
  mongoose.model<TherapistDocument>("Therapist", TherapistSchema);
