"use client";

import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";
import { FEATURES } from "@/constants/home";
import AnimatedSectionHeader from "@/components/ui/AnimatedSectionHeader";
import FeatureCard from "./FeatureCard";

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export default function Features() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="features"
      ref={ref}
      className="py-24 space-y-12 scroll-mt-16"
    >
      <AnimatedSectionHeader
        label="Features"
        title="Everything you need to understand what people are feeling."
        description="A complete toolkit for mental health signal detection — accurate, explainable, and built with privacy at its core."
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {FEATURES.map((feature, i) => (
          <FeatureCard key={feature.title} {...feature} index={i} />
        ))}
      </motion.div>
    </section>
  );
}