"use client";

import { useState } from "react";
import { X, Calendar, Clock, MessageSquare, CheckCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Counsellor, TIME_SLOTS } from "@/constants/counsellors";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";

interface BookingModalProps {
  counsellor: Counsellor;
  onClose: () => void;
}

export default function BookingModal({ counsellor, onClose }: BookingModalProps) {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = getLocalDateString(new Date());
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = getLocalDateString(maxDate);

  const handleSubmit = () => {
    if (!selectedDate || !selectedTime) return;
    setSubmitted(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", damping: 22, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[var(--surface)] rounded-[var(--radius-xl)]
                   border border-[var(--border)] shadow-[var(--shadow-md)] overflow-hidden"
      >
        {/* Accent top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[var(--accent)] via-cyan-300 to-[var(--accent)]" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text)]">
              {t("confirmBooking")}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {t("bookingFor")}: {counsellor.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-md flex items-center justify-center
                       text-[var(--text-muted)] hover:text-[var(--text)]
                       hover:bg-[var(--surface-raised)] transition-colors"
            aria-label={t("close")}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center gap-4 py-6"
              >
                <div className="size-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <CheckCircle size={24} className="text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--text)]">{t("requestSent")}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs">
                    {t("bookingConfirmed")}
                  </p>
                </div>
                <div className="text-xs text-[var(--text-secondary)] bg-[var(--surface-raised)] rounded-md px-4 py-2 border border-[var(--border)]">
                  {counsellor.name} · {selectedDate} · {selectedTime}
                </div>
                <Button variant="secondary" size="sm" onClick={onClose}>
                  {t("close")}
                </Button>
              </motion.div>
            ) : (
              <motion.div key="form" className="space-y-4">
                {/* Date */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
                    <Calendar size={11} />
                    {t("selectDate")}
                  </label>
                  <input
                    type="date"
                    min={today}
                    max={maxDateStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-[var(--radius-md)] text-sm
                               bg-[var(--surface-raised)] text-[var(--text)]
                               border border-[var(--border)]
                               focus:border-[var(--border-active)] focus:outline-none
                               focus:shadow-[0_0_0_3px_var(--accent-glow)]
                               transition-all duration-200"
                  />
                </div>

                {/* Time slots */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
                    <Clock size={11} />
                    {t("selectTime")}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2 rounded-md text-xs font-medium transition-all duration-150
                          ${
                            selectedTime === slot
                              ? "bg-[var(--accent)] text-[#080c10] shadow-[0_0_12px_var(--accent-glow)]"
                              : "bg-[var(--surface-raised)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--border-active)] hover:text-[var(--text)]"
                          }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
                    <MessageSquare size={11} />
                    {t("notes")}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t("notesPlaceholder")}
                    rows={3}
                    className="w-full resize-none px-3 py-2.5 rounded-[var(--radius-md)] text-sm
                               bg-[var(--surface-raised)] text-[var(--text)]
                               border border-[var(--border)] placeholder:text-[var(--text-muted)]
                               focus:border-[var(--border-active)] focus:outline-none
                               focus:shadow-[0_0_0_3px_var(--accent-glow)]
                               transition-all duration-200"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button variant="ghost" size="sm" className="flex-1" onClick={onClose}>
                    {t("cancel")}
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={!selectedDate || !selectedTime}
                    onClick={handleSubmit}
                  >
                    {t("bookSession")}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
