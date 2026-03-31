"use client";

import { useState } from "react";
import { Star, Clock, Globe, ChevronRight } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Counsellor } from "@/constants/counsellors";
import Button from "@/components/ui/Button";
import BookingModal from "./BookingModal";
import { useTranslation } from "@/hooks/useTranslation";

interface CounsellorCardProps {
  counsellor: Counsellor;
}

export default function CounsellorCard({ counsellor }: CounsellorCardProps) {
  const { t } = useTranslation();
  const [booking, setBooking] = useState(false);

  return (
    <>
      <div
        className="flex flex-col gap-4 p-5 rounded-[var(--radius-lg)]
                   bg-[var(--surface)] border border-[var(--border)]
                   hover:border-[var(--border-active)] transition-all duration-200
                   hover:shadow-[var(--shadow-glow)]"
      >
        {/* Top row: avatar + name + badge */}
        <div className="flex items-start gap-4">
          <div
            className="size-12 rounded-full bg-[var(--accent-dim)] border border-[var(--border-active)]
                       flex items-center justify-center text-[var(--accent)] text-sm font-bold shrink-0"
          >
            {counsellor.avatar}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-[var(--text)] leading-snug">
                {counsellor.name}
              </h3>
              <span
                className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                  counsellor.available
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : "bg-[var(--surface-raised)] text-[var(--text-muted)] border-[var(--border)]"
                }`}
              >
                {counsellor.available ? t("available") : t("unavailable")}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-1">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              <span className="text-xs font-medium text-[var(--text)]">
                {counsellor.rating}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                ({counsellor.reviews} {t("reviews")})
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          {counsellor.bio}
        </p>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1.5">
          {counsellor.specialty.map((s) => (
            <span
              key={s}
              className="text-[10px] px-2 py-0.5 rounded-full
                         bg-[var(--accent-dim)] text-[var(--accent)]
                         border border-[var(--border-active)] font-medium"
            >
              {s}
            </span>
          ))}
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {counsellor.experience}
          </span>
          <span className="flex items-center gap-1">
            <Globe size={11} />
            {counsellor.language.slice(0, 2).join(", ")}
            {counsellor.language.length > 2 && ` +${counsellor.language.length - 2}`}
          </span>
        </div>

        {/* Footer: fee + book */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">
              {counsellor.fee}
              <span className="text-[var(--text-muted)] font-normal text-xs">
                {t("perSession")}
              </span>
            </p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
              {t("nextAvailable")} {counsellor.nextSlot}
            </p>
          </div>

          <Button
            size="sm"
            variant={counsellor.available ? "primary" : "secondary"}
            disabled={!counsellor.available}
            icon={<ChevronRight size={13} />}
            iconPosition="right"
            onClick={() => setBooking(true)}
          >
            {t("bookSession")}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {booking && (
          <BookingModal counsellor={counsellor} onClose={() => setBooking(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
