/**
 * Location service helpers.
 *
 * Provides:
 *  - Haversine formula for accurate great-circle distance calculation
 *  - Reverse-geocoding via Nominatim (no API key required) or Google Maps
 *    (requires NEXT_PUBLIC_MAPS_API_KEY + NEXT_PUBLIC_LOCATION_SERVICE_PROVIDER=google)
 */

import type { TherapistCoordinates } from "@/types/therapist.types";

/** Earth's mean radius in kilometres */
const EARTH_RADIUS_KM = 6371;

/**
 * Convert degrees to radians.
 */
function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Calculate the great-circle distance between two coordinates using the
 * Haversine formula.
 *
 * @returns Distance in kilometres (rounded to one decimal place).
 */
export function haversineDistance(
  from: TherapistCoordinates,
  to: TherapistCoordinates
): number {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.lat)) *
      Math.cos(toRadians(to.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((EARTH_RADIUS_KM * c).toFixed(1));
}

/**
 * Filter and sort an array of items that have a `coordinates` field by
 * proximity to the user's position.
 *
 * @param items       Array of objects that have a `coordinates` field.
 * @param userCoords  User's current position.
 * @param radiusKm    Maximum distance to include (inclusive). Pass `Infinity`
 *                    to include all items.
 * @returns Array sorted by distance ascending, each item augmented with a
 *          `distanceKm` property.
 */
export function filterAndSortByDistance<
  T extends { coordinates: TherapistCoordinates },
>(
  items: T[],
  userCoords: TherapistCoordinates,
  radiusKm = Infinity
): (T & { distanceKm: number })[] {
  return items
    .map((item) => ({
      ...item,
      distanceKm: haversineDistance(userCoords, item.coordinates),
    }))
    .filter((item) => item.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/** Result returned by the reverse-geocoding helpers */
export interface ReverseGeoResult {
  displayName: string;
  city: string | null;
  country: string | null;
}

/**
 * Reverse-geocode a coordinate using Nominatim (OpenStreetMap).
 * This is called client-side; no API key is required.
 */
export async function reverseGeocodeNominatim(
  coords: TherapistCoordinates
): Promise<ReverseGeoResult> {
  const url =
    `https://nominatim.openstreetmap.org/reverse` +
    `?lat=${coords.lat}&lon=${coords.lng}&format=json`;

  const res = await fetch(url, {
    headers: { "Accept-Language": "en" },
  });

  if (!res.ok) throw new Error("Nominatim reverse-geocode failed");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json();
  const addr = data?.address ?? {};

  const city =
    addr.city ?? addr.town ?? addr.village ?? addr.suburb ?? null;

  return {
    displayName: data.display_name ?? `${coords.lat}, ${coords.lng}`,
    city,
    country: addr.country ?? null,
  };
}

/**
 * Reverse-geocode a coordinate using the Google Maps Geocoding API.
 * Requires `NEXT_PUBLIC_MAPS_API_KEY` to be set.
 */
export async function reverseGeocodeGoogle(
  coords: TherapistCoordinates
): Promise<ReverseGeoResult> {
  const apiKey = process.env.NEXT_PUBLIC_MAPS_API_KEY;
  if (!apiKey) throw new Error("NEXT_PUBLIC_MAPS_API_KEY is not configured");

  const url =
    `https://maps.googleapis.com/maps/api/geocode/json` +
    `?latlng=${coords.lat},${coords.lng}&key=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Google Geocoding API request failed");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json();
  const result = data?.results?.[0];

  if (!result) throw new Error("No results from Google Geocoding API");

  const components: { types: string[]; long_name: string }[] =
    result.address_components ?? [];

  const city =
    components.find((c) => c.types.includes("locality"))?.long_name ??
    components.find((c) =>
      c.types.includes("administrative_area_level_2")
    )?.long_name ??
    null;

  const country =
    components.find((c) => c.types.includes("country"))?.long_name ?? null;

  return {
    displayName: result.formatted_address ?? `${coords.lat}, ${coords.lng}`,
    city,
    country,
  };
}

/**
 * Reverse-geocode using the provider configured via
 * `NEXT_PUBLIC_LOCATION_SERVICE_PROVIDER` (defaults to "nominatim").
 *
 * Safe to call from client components.
 */
export async function reverseGeocode(
  coords: TherapistCoordinates
): Promise<ReverseGeoResult> {
  const provider =
    process.env.NEXT_PUBLIC_LOCATION_SERVICE_PROVIDER ?? "nominatim";

  if (provider === "google") {
    return reverseGeocodeGoogle(coords);
  }

  return reverseGeocodeNominatim(coords);
}
