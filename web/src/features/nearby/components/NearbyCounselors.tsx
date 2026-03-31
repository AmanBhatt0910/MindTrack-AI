"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Star, ExternalLink, Filter, Map, List, Loader2, AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { COUNSELLORS } from "@/constants/counsellors";

type DistanceFilter = "5" | "10" | "25" | "any";

interface CounsellorWithDistance {
  id: string;
  name: string;
  specialty: string[];
  experience: string;
  language: string[];
  rating: number;
  reviews: number;
  available: boolean;
  nextSlot: string;
  fee: string;
  avatar: string;
  bio: string;
  distance: number; // km (simulated)
  lat: number;
  lng: number;
}

// Simulate distances from user location
function assignDistances(lat: number, lng: number): CounsellorWithDistance[] {
  // Simulate counselors at nearby locations (real implementation would use geocoding API)
  const offsets = [
    { dlat: 0.02, dlng: 0.03, base: 2.8 },
    { dlat: -0.05, dlng: 0.01, base: 5.4 },
    { dlat: 0.08, dlng: -0.04, base: 8.7 },
    { dlat: -0.01, dlng: 0.07, base: 7.2 },
    { dlat: 0.12, dlng: 0.09, base: 14.3 },
    { dlat: -0.09, dlng: -0.06, base: 10.8 },
  ];

  return COUNSELLORS.map((c, i) => {
    const offset = offsets[i % offsets.length];
    return {
      ...c,
      distance: parseFloat((offset.base + Math.random() * 2).toFixed(1)),
      lat: lat + offset.dlat,
      lng: lng + offset.dlng,
    };
  }).sort((a, b) => a.distance - b.distance);
}

// Default locations when no permission given (major Indian cities)
const DEFAULT_LOCATIONS = [
  { name: "Mumbai", lat: 19.076, lng: 72.8777 },
  { name: "Delhi", lat: 28.6139, lng: 77.209 },
  { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
];

export default function NearbyCounselors() {
  const { t } = useTranslation();
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "granted" | "denied" | "error">("idle");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>("any");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedCity, setSelectedCity] = useState(0);

  const activeLoc = userCoords ?? DEFAULT_LOCATIONS[selectedCity];

  // Compute counselors with distances derived from active location (no setState-in-effect)
  const counselors = useMemo(
    () => assignDistances(activeLoc.lat, activeLoc.lng),
    [activeLoc.lat, activeLoc.lng]
  );

  const requestLocation = () => {
    setLocationStatus("loading");
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationStatus("granted");
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setLocationStatus("denied");
      },
      { timeout: 10000 }
    );
  };

  const filtered = counselors.filter((c) => {
    if (distanceFilter === "any") return true;
    return c.distance <= parseInt(distanceFilter);
  });

  const DISTANCE_FILTERS: { value: DistanceFilter; labelKey: string }[] = [
    { value: "any", labelKey: "anyDistance" },
    { value: "5", labelKey: "within5km" },
    { value: "10", labelKey: "within10km" },
    { value: "25", labelKey: "within25km" },
  ];

  return (
    <div className="space-y-6">
      {/* Location controls */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[var(--text)]">{t("findNearby")}</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {locationStatus === "granted"
                ? t("usingCurrentLocation")
                : locationStatus === "denied"
                ? t("locationDenied")
                : t("allowLocationPrompt")}
            </p>
          </div>
          <button
            onClick={requestLocation}
            disabled={locationStatus === "loading"}
            className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium
                       bg-[var(--accent)] text-[#080c10] hover:opacity-90 disabled:opacity-60
                       transition-all duration-200"
          >
            {locationStatus === "loading" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Navigation size={14} />
            )}
            {locationStatus === "loading" ? t("locating") : t("findNearby")}
          </button>
        </div>

        {/* City fallback selector */}
        {locationStatus !== "granted" && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)]">{t("browseByCity")}:</span>
            <div className="flex gap-2">
              {DEFAULT_LOCATIONS.map((loc, i) => (
                <button
                  key={loc.name}
                  onClick={() => setSelectedCity(i)}
                  className={`px-2.5 py-1 rounded-[var(--radius-sm)] text-xs transition-all
                    ${selectedCity === i
                      ? "bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--border-active)]"
                      : "text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--border-active)]"
                    }`}
                >
                  {loc.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filters & view toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Distance filters */}
        <div className="flex items-center gap-1.5">
          <Filter size={13} className="text-[var(--text-muted)]" />
          <span className="text-xs text-[var(--text-muted)]">{t("filterByDistance")}:</span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {DISTANCE_FILTERS.map(({ value, labelKey }) => (
            <button
              key={value}
              onClick={() => setDistanceFilter(value)}
              className={`px-2.5 py-1 rounded-[var(--radius-sm)] text-xs transition-all border
                ${distanceFilter === value
                  ? "bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--border-active)]"
                  : "text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--border-active)]"
                }`}
            >
              {t(labelKey as Parameters<typeof t>[0])}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="ml-auto flex items-center gap-1 p-1 rounded-[var(--radius-md)] bg-[var(--surface-raised)] border border-[var(--border)]">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] text-xs transition-all
              ${viewMode === "list" ? "bg-[var(--surface)] text-[var(--text)] shadow-sm" : "text-[var(--text-muted)]"}`}
          >
            <List size={12} />
            {t("listView")}
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] text-xs transition-all
              ${viewMode === "map" ? "bg-[var(--surface)] text-[var(--text)] shadow-sm" : "text-[var(--text-muted)]"}`}
          >
            <Map size={12} />
            {t("mapView")}
          </button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-[var(--text-muted)]">
        {filtered.length} {t("counselorsFound")}
        {distanceFilter !== "any" ? ` ${t("withinDistance")} ${distanceFilter} km` : ""}
      </p>

      {/* Map view */}
      <AnimatePresence mode="wait">
        {viewMode === "map" && (
          <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border)]"
          >
            {/* OpenStreetMap embed with counselor location */}
            <div className="relative h-[400px]">
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                  activeLoc.lng - 0.15
                }%2C${
                  activeLoc.lat - 0.15
                }%2C${
                  activeLoc.lng + 0.15
                }%2C${
                  activeLoc.lat + 0.15
                }&layer=mapnik`}
                className="w-full h-full"
                title="Counselor locations map"
                loading="lazy"
              />
              {/* Overlay with counselor pins info */}
              <div className="absolute top-3 right-3 bg-[var(--surface-overlay)] backdrop-blur-sm rounded-[var(--radius-md)] border border-[var(--border)] p-3 max-w-[200px]">
                <p className="text-xs font-medium text-[var(--text)] mb-2">{filtered.length} {t("nearby")}</p>
                {filtered.slice(0, 3).map((c) => (
                  <div key={c.id} className="flex items-center gap-1.5 py-1">
                    <MapPin size={10} className="text-[var(--accent)] shrink-0" />
                    <span className="text-[11px] text-[var(--text-secondary)] truncate">{c.name}</span>
                    <span className="text-[10px] text-[var(--text-muted)] shrink-0">{c.distance}km</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* List view */}
        {viewMode === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((counselor) => (
              <motion.div
                key={counselor.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4 hover:border-[var(--border-active)] transition-all duration-200"
              >
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-full bg-[var(--accent-dim)] border border-[var(--border-active)] flex items-center justify-center text-sm font-bold text-[var(--accent)] shrink-0">
                    {counselor.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--text)] truncate">{counselor.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <MapPin size={10} className="text-[var(--accent)] shrink-0" />
                      <span className="text-xs text-[var(--accent)] font-medium">
                        {counselor.distance} {t("kmAway")}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border
                      ${counselor.available
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "bg-[var(--surface-raised)] text-[var(--text-muted)] border-[var(--border)]"
                      }`}
                  >
                    <span className={`size-1 rounded-full ${counselor.available ? "bg-green-400" : "bg-[var(--text-muted)]"}`} />
                    {counselor.available ? t("available") : t("unavailable")}
                  </span>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1.5">
                  {counselor.specialty.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--surface-raised)] text-[var(--text-muted)] border border-[var(--border)]"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Rating & fee */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    <span className="font-medium text-[var(--text)]">{counselor.rating}</span>
                    <span className="text-[var(--text-muted)]">({counselor.reviews})</span>
                  </div>
                  <span className="font-semibold text-[var(--accent)]">{counselor.fee}{t("perSession")}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${counselor.lat},${counselor.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] text-xs
                               bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--border-active)]
                               hover:opacity-80 transition-all"
                  >
                    <Navigation size={11} />
                    {t("getDirections")}
                  </a>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${counselor.lat}&mlon=${counselor.lng}&zoom=15`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-3 py-2 rounded-[var(--radius-md)] text-xs
                               border border-[var(--border)] text-[var(--text-secondary)]
                               hover:border-[var(--border-active)] hover:text-[var(--text)] transition-all"
                    aria-label={t("showOnMap")}
                  >
                    <ExternalLink size={11} />
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <AlertCircle size={24} className="text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)]">
            {t("noCounselorsInRange")}
          </p>
        </div>
      )}
    </div>
  );
}
