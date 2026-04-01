/**
 * GET /api/therapists/[id]
 *
 * Returns the full profile of the therapist with the given MongoDB ObjectId.
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { TherapistModel } from "@/models/Therapist";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  _req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { error: "Invalid therapist ID" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const doc = await TherapistModel.findById(id).lean();

    if (!doc) {
      return NextResponse.json(
        { error: "Therapist not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: String(doc._id),
      name: doc.name,
      title: doc.title,
      specializations: doc.specializations,
      credentials: doc.credentials,
      languages: doc.languages,
      experience: doc.experience,
      bio: doc.bio,
      avatar: doc.avatar,
      email: doc.email,
      phone: doc.phone,
      clinicName: doc.clinicName,
      clinicAddress: doc.clinicAddress,
      city: doc.city,
      coordinates: doc.coordinates,
      available: doc.available,
      nextAvailable: doc.nextAvailable,
      availabilitySlots: doc.availabilitySlots,
      fee: doc.fee,
      rating: doc.rating,
      reviews: doc.reviews,
    });
  } catch (err) {
    console.error("GET /api/therapists/[id] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
