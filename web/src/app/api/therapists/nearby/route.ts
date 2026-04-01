/**
 * GET /api/therapists/nearby?lat=<lat>&lng=<lng>&radius=<km>
 *
 * Returns therapists within `radius` km of the supplied coordinates,
 * sorted by real distance using the Haversine formula.
 *
 * Query params:
 *   lat    – user latitude  (required)
 *   lng    – user longitude (required)
 *   radius – search radius in km (default: 25)
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { TherapistModel } from "@/models/Therapist";
import { THERAPIST_SEED_DATA } from "@/lib/therapistSeed";
import { haversineDistance } from "@/services/locationService";
import type { TherapistWithDistance } from "@/types/therapist.types";

/** Auto-seed the collection with sample data if it is empty. */
async function ensureSeeded(): Promise<void> {
  const count = await TherapistModel.countDocuments();
  if (count === 0) {
    await TherapistModel.insertMany(THERAPIST_SEED_DATA);
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;

  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const radiusStr = searchParams.get("radius") ?? "25";

  if (!latStr || !lngStr) {
    return NextResponse.json(
      { error: "lat and lng query parameters are required" },
      { status: 400 }
    );
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);
  const radius = parseFloat(radiusStr);

  if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
    return NextResponse.json(
      { error: "lat, lng, and radius must be valid numbers" },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    await ensureSeeded();

    const all = await TherapistModel.find().lean();

    const userCoords = { lat, lng };

    const withDistances: TherapistWithDistance[] = all
      .map((doc) => {
        const distanceKm = haversineDistance(userCoords, doc.coordinates);
        return {
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
          distanceKm,
        };
      })
      .filter((t) => t.distanceKm <= radius)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return NextResponse.json(withDistances);
  } catch (err) {
    console.error("GET /api/therapists/nearby error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
