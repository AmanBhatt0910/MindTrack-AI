"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import CrisisModal from "./CrisisModal";

export default function StrugglingButton() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full
                   bg-red-500/10 text-red-400 border border-red-500/25
                   hover:bg-red-500/20 hover:border-red-500/50
                   transition-all duration-200 text-sm font-medium
                   focus-visible:outline-none focus-visible:ring-2
                   focus-visible:ring-red-400 focus-visible:ring-offset-2
                   focus-visible:ring-offset-[var(--surface)]"
        aria-label="Get immediate crisis support"
      >
        <Heart size={14} className="shrink-0" aria-hidden />
        {t("imStruggling")}
      </motion.button>

      <CrisisModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
