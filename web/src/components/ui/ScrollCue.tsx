"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function ScrollCue() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-(--text-muted)"
    >
      <span className="text-[10px] uppercase tracking-widest">Scroll</span>
      <ChevronDown size={14} className="animate-bounce" />
    </motion.div>
  );
}