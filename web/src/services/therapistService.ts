/**
 * Therapist API client.
 *
 * All requests go through the shared axios instance (web/src/lib/axios.ts)
 * so the Authorization header and base URL are handled automatically.
 *
 * Endpoints served by web/src/app/api/therapists/*
 */

import { api } from "@/lib/axios";
import type {
  TherapistWithDistance,
  Therapist,
  NearbyTherapistsQuery,
  SearchTherapistsQuery,
} from "@/types/therapist.types";

/**
 * Fetch therapists within `radius` km of the given coordinates.
 * Results are sorted by distance (ascending) by the server.
 */
export async function fetchNearbyTherapists(
  params: NearbyTherapistsQuery
): Promise<TherapistWithDistance[]> {
  const { lat, lng, radius = 25 } = params;
  const res = await api.get<TherapistWithDistance[]>(
    "/therapists/nearby",
    { params: { lat, lng, radius } }
  );
  return res.data;
}

/**
 * Fetch a single therapist by their database ID.
 */
export async function fetchTherapistById(id: string): Promise<Therapist> {
  const res = await api.get<Therapist>(`/therapists/${id}`);
  return res.data;
}

/**
 * Search therapists by specialty, city, language, or availability.
 * All parameters are optional; supply at least one for a meaningful result.
 */
export async function searchTherapists(
  params: SearchTherapistsQuery
): Promise<Therapist[]> {
  const res = await api.get<Therapist[]>("/therapists/search", { params });
  return res.data;
}
