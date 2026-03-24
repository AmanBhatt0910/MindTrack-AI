"use client";

import { motion, type Variants } from "framer-motion";
import { STATS } from "@/constants/home";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function StatsStrip() {
  return (
    <motion.div
      variants={fadeUp}
      className="flex flex-wrap justify-center gap-x-8 gap-y-4 pt-2"
    >
      {STATS.map((stat) => (
        <div key={stat.label} className="flex flex-col items-center gap-0.5">
          <span
            className="text-2xl font-bold tracking-tight text-(--text)"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {stat.value}
          </span>
          <span className="text-xs text-(--text-muted) uppercase tracking-widest">
            {stat.label}
          </span>
        </div>
      ))}
    </motion.div>
  );
}