"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import SectionLabel from "./SectionLabel";

interface AnimatedSectionHeaderProps {
  label: string;
  title: string;
  description?: string;
  className?: string;
}

export default function AnimatedSectionHeader({
  label,
  title,
  description,
  className = "",
}: AnimatedSectionHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className={`space-y-4 text-center ${className}`}
    >
      <SectionLabel>{label}</SectionLabel>
      <h2
        className="text-[clamp(1.8rem,4vw,2.8rem)] font-bold tracking-[-0.03em]
                   text-(--text) max-w-xl mx-auto leading-tight"
      >
        {title}
      </h2>
      {description && (
        <p className="text-(--text-secondary) max-w-lg mx-auto text-sm md:text-base">
          {description}
        </p>
      )}
    </motion.div>
  );
}