"use client";

import { motion, type Variants } from "framer-motion";

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6 } },
};

export default function LiveBadge() {
  return (
    <motion.div
      variants={fadeIn}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                 bg-(--surface) border border-(--border)
                 text-xs text-(--text-secondary)"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <span
        className="size-1.5 rounded-full bg-emerald-400 pulse-dot"
        aria-hidden
      />
      Model v2.4 — 94.2% accuracy on benchmark
    </motion.div>
  );
}