"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Star, ExternalLink, Filter, Map, List, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocation } from "@/hooks/useLocation";
import { fetchNearbyTherapists } from "@/services/therapistService";
import type { TherapistWithDistance } from "@/types/therapist.types";

type DistanceFilter = "5" | "10" | "25" | "any";

// Fallback coordinates (geographic center of India) used only when location
// is unavailable, so the map still renders something sensible.
const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };

export default function NearbyCounselors() {
  const { t } = useTranslation();
  const { latitude, longitude, status, error, refresh } = useLocation();
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>("any");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const [counselors, setCounselors] = useState<TherapistWithDistance[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const activeLoc =
    latitude !== null && longitude !== null
      ? { lat: latitude, lng: longitude }
      : INDIA_CENTER;

  // Fetch real therapists from the API whenever the user's location is known
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setFetchLoading(true);
      setFetchError(null);
      try {
        const data = await fetchNearbyTherapists({
          lat: activeLoc.lat,
          lng: activeLoc.lng,
          radius: 100, // 100 km covers the local region; UI filters narrow further
        });
        if (!cancelled) setCounselors(data);
      } catch {
        if (!cancelled) setFetchError("Could not load therapists. Please try again.");
      } finally {
        if (!cancelled) setFetchLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [activeLoc.lat, activeLoc.lng]);

  const filtered = counselors.filter((c) => {
    if (distanceFilter === "any") return true;
    return c.distanceKm <= parseInt(distanceFilter);
  });

  const DISTANCE_FILTERS: { value: DistanceFilter; labelKey: string }[] = [
    { value: "any", labelKey: "anyDistance" },
    { value: "5", labelKey: "within5km" },
    { value: "10", labelKey: "within10km" },
    { value: "25", labelKey: "within25km" },
  ];

  return (
    <div className="space-y-6">
      {/* Location status banner */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[var(--text)]">{t("findNearby")}</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {status === "loading" && t("gettingLocation")}
              {status === "granted" && t("usingCurrentLocation")}
              {status === "denied" && t("locationDenied")}
              {status === "error" && (error ?? t("locationError"))}
              {status === "idle" && t("allowLocationPrompt")}
            </p>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            {status === "loading" && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-muted)]">
                <Loader2 size={12} className="animate-spin" />
                {t("locating")}
              </span>
            )}
            {status === "granted" && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs bg-green-500/10 border border-green-500/20 text-green-400">
                <MapPin size={12} />
                {t("locationFound")}
              </span>
            )}
            {(status === "denied" || status === "error" || status === "idle") && (
              <button
                onClick={refresh}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium
                           bg-[var(--accent)] text-[#080c10] hover:opacity-90 transition-all duration-200"
              >
                <RefreshCw size={12} />
                {status === "idle" ? t("findNearby") : t("retryLocation")}
              </button>
            )}
          </div>
        </div>
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

      {/* Results count / loading / error */}
      {fetchLoading ? (
        <p className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <Loader2 size={12} className="animate-spin" />
          Loading therapists…
        </p>
      ) : fetchError ? (
        <div className="flex items-center gap-2 text-xs text-rose-400">
          <AlertCircle size={12} />
          {fetchError}
        </div>
      ) : (
        <p className="text-xs text-[var(--text-muted)]">
          {filtered.length} {t("counselorsFound")}
          {distanceFilter !== "any" ? ` ${t("withinDistance")} ${distanceFilter} km` : ""}
          {status === "idle" && (
            <span className="ml-1 text-[var(--text-muted)] italic">
              ({t("allowLocationPrompt")})
            </span>
          )}
        </p>
      )}

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
            {/* OpenStreetMap embed centred on the active location */}
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
              {/* Overlay listing nearest therapists */}
              <div className="absolute top-3 right-3 bg-[var(--surface-overlay)] backdrop-blur-sm rounded-[var(--radius-md)] border border-[var(--border)] p-3 max-w-[200px]">
                <p className="text-xs font-medium text-[var(--text)] mb-2">{filtered.length} {t("nearby")}</p>
                {filtered.slice(0, 3).map((c) => (
                  <div key={c.id} className="flex items-center gap-1.5 py-1">
                    <MapPin size={10} className="text-[var(--accent)] shrink-0" />
                    <span className="text-[11px] text-[var(--text-secondary)] truncate">{c.name}</span>
                    <span className="text-[10px] text-[var(--text-muted)] shrink-0">{c.distanceKm}km</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* List view */}
        {viewMode === "list" && !fetchLoading && (
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
                        {counselor.distanceKm} {t("kmAway")}
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
                  {counselor.specializations.map((s) => (
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
                    href={`https://www.google.com/maps/dir/?api=1&destination=${counselor.coordinates.lat},${counselor.coordinates.lng}`}
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
                    href={`https://www.openstreetmap.org/?mlat=${counselor.coordinates.lat}&mlon=${counselor.coordinates.lng}&zoom=15`}
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

      {!fetchLoading && filtered.length === 0 && !fetchError && (
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

