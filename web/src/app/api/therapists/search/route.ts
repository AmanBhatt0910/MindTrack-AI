/**
 * GET /api/therapists/search?specialty=<s>&city=<c>&language=<l>&available=<bool>
 *
 * Search therapists by specialty, city, language, or availability.
 * All parameters are optional; supply at least one for a useful result.
 * Results are sorted by rating (descending).
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { TherapistModel } from "@/models/Therapist";
import { THERAPIST_SEED_DATA } from "@/lib/therapistSeed";

async function ensureSeeded(): Promise<void> {
  const count = await TherapistModel.countDocuments();
  if (count === 0) {
    await TherapistModel.insertMany(THERAPIST_SEED_DATA);
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;

  const specialty = searchParams.get("specialty");
  const city = searchParams.get("city");
  const language = searchParams.get("language");
  const availableParam = searchParams.get("available");

  // Build a Mongoose filter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  if (specialty) {
    filter.specializations = { $regex: specialty, $options: "i" };
  }
  if (city) {
    filter.city = { $regex: city, $options: "i" };
  }
  if (language) {
    filter.languages = { $regex: language, $options: "i" };
  }
  if (availableParam !== null) {
    filter.available = availableParam === "true";
  }

  try {
    await connectDB();
    await ensureSeeded();

    const docs = await TherapistModel.find(filter).sort({ rating: -1 }).lean();

    const therapists = docs.map((doc) => ({
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
    }));

    return NextResponse.json(therapists);
  } catch (err) {
    console.error("GET /api/therapists/search error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
