"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { HOW_IT_WORKS_STEPS } from "@/constants/home";
import AnimatedSectionHeader from "@/components/ui/AnimatedSectionHeader";
import TerminalPreview from "@/components/ui/TerminalPreview";
import StepCard from "./StepCard";

export default function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="py-24 space-y-16 scroll-mt-16"
    >
      <AnimatedSectionHeader
        label="How it works"
        title="From post to insight in three steps."
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="flex flex-col md:flex-row items-start md:items-center gap-10 md:gap-0 justify-between"
      >
        {HOW_IT_WORKS_STEPS.map((step, i) => (
          <StepCard
            key={step.step}
            {...step}
            index={i}
            total={HOW_IT_WORKS_STEPS.length}
          />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="max-w-md mx-auto"
      >
        <TerminalPreview />
      </motion.div>
    </section>
  );
}