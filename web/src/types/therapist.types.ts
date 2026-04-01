/**
 * Shared TypeScript types for the therapist / counsellor domain.
 *
 * These types are used by:
 *  - the Mongoose model  (web/src/models/Therapist.ts)
 *  - the API routes      (web/src/app/api/therapists/*)
 *  - the service layer   (web/src/services/therapistService.ts)
 *  - UI components       (NearbyCounselors, TherapistAutoMessageAlert, …)
 */

export interface TherapistCoordinates {
  lat: number;
  lng: number;
}

export interface AvailabilitySlot {
  day: string;         // e.g. "Monday"
  startTime: string;   // e.g. "09:00"
  endTime: string;     // e.g. "17:00"
}

/** Full therapist profile as stored in the database */
export interface Therapist {
  id: string;
  name: string;
  /** Professional title, e.g. "Clinical Psychologist" */
  title: string;
  /** Areas of specialisation, e.g. ["Depression", "Anxiety"] */
  specializations: string[];
  credentials: string;      // e.g. "PhD, MPhil, RCI Registered"
  languages: string[];
  experience: string;       // e.g. "8 years"
  bio: string;
  avatar: string;           // two-letter initials

  // Contact & location
  email: string;
  phone: string;
  clinicName: string;
  clinicAddress: string;
  city: string;
  coordinates: TherapistCoordinates;

  // Scheduling & pricing
  available: boolean;
  nextAvailable: string;    // human-readable, e.g. "Today, 4:00 PM"
  availabilitySlots: AvailabilitySlot[];
  fee: string;              // e.g. "₹800"

  // Social proof
  rating: number;
  reviews: number;
}

/** Therapist enriched with a real distance from the user's position */
export interface TherapistWithDistance extends Therapist {
  /** Straight-line distance in kilometres calculated via Haversine formula */
  distanceKm: number;
}

/** Query parameters accepted by GET /api/therapists/nearby */
export interface NearbyTherapistsQuery {
  lat: number;
  lng: number;
  /** Search radius in kilometres (default: 25) */
  radius?: number;
}

/** Query parameters accepted by GET /api/therapists/search */
export interface SearchTherapistsQuery {
  specialty?: string;
  city?: string;
  language?: string;
  available?: boolean;
}
