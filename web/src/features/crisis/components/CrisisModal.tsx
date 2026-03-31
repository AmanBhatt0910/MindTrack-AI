"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Phone, MessageCircle, Heart, ExternalLink } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface CrisisModalProps {
  open: boolean;
  onClose: () => void;
}

const CRISIS_RESOURCES = [
  {
    name: "iCall",
    number: "9152987821",
    description: "Psychosocial support helpline by TISS",
    hours: "Mon–Sat: 8 AM – 10 PM",
    is24x7: false,
  },
  {
    name: "Vandrevala Foundation",
    number: "1860-2662-345",
    description: "24/7 mental health helpline — free & confidential",
    hours: "24/7",
    is24x7: true,
  },
  {
    name: "NIMHANS",
    number: "080-46110007",
    description: "National Institute of Mental Health and Neurosciences",
    hours: "Mon–Sat: 9 AM – 5 PM",
    is24x7: false,
  },
  {
    name: "Snehi",
    number: "044-24640050",
    description: "Emotional support and suicide prevention",
    hours: "24/7",
    is24x7: true,
  },
];

export default function CrisisModal({ open, onClose }: CrisisModalProps) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", damping: 22, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-[var(--surface)] rounded-[var(--radius-xl)]
                       border border-red-500/20 shadow-[0_0_80px_rgba(239,68,68,0.2)] overflow-hidden"
          >
            {/* Red top accent */}
            <div className="h-1 w-full bg-gradient-to-r from-red-500 via-rose-400 to-red-500" />

            {/* Header */}
            <div className="px-6 py-5 bg-red-500/5 border-b border-red-500/10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="size-11 rounded-full bg-red-500/10 border border-red-500/20
                                flex items-center justify-center"
                  >
                    <Heart size={18} className="text-red-400" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[var(--text)] text-base">
                      {t("crisisTitle")}
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {t("crisisSubtitle")}
                    </p>
                  </div>
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
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {t("crisisIntro")}
              </p>

              <div className="space-y-3">
                {CRISIS_RESOURCES.map((resource) => (
                  <div
                    key={resource.name}
                    className="flex items-center justify-between p-4 rounded-[var(--radius-md)]
                               bg-[var(--surface-raised)] border border-[var(--border)]
                               hover:border-red-500/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-[var(--text)]">
                          {resource.name}
                        </p>
                        {resource.is24x7 ? (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10
                                       text-green-400 border border-green-500/20 font-medium"
                          >
                            24/7
                          </span>
                        ) : (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10
                                       text-amber-400 border border-amber-500/20 font-medium"
                          >
                            {resource.hours}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {resource.description}
                      </p>
                    </div>
                    <a
                      href={`tel:${resource.number.replace(/[-\s]/g, "")}`}
                      className="ml-4 flex items-center gap-1.5 px-3 py-2 rounded-md
                                 bg-red-500/10 text-red-400 border border-red-500/20
                                 hover:bg-red-500/20 transition-colors text-xs font-medium
                                 shrink-0 whitespace-nowrap"
                      aria-label={`Call ${resource.name}: ${resource.number}`}
                    >
                      <Phone size={11} />
                      {resource.number}
                    </a>
                  </div>
                ))}
              </div>

              {/* iCall chat */}
              <div className="p-4 rounded-[var(--radius-md)] bg-blue-500/5 border border-blue-500/15">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle size={14} className="text-blue-400" />
                  <p className="text-xs font-medium text-[var(--text)]">
                    {t("iCallChat")}
                  </p>
                </div>
                <p className="text-xs text-[var(--text-muted)] mb-2">
                  {t("chatOnline")}
                </p>
                <a
                  href="https://icallhelpline.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-400
                             hover:text-blue-300 hover:underline transition-colors"
                >
                  {t("visitIcall")} <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
