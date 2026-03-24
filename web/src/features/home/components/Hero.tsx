"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import GridBackground from "@/components/ui/GridBackground";
import LiveBadge from "@/components/ui/LiveBadge";
import StatsStrip from "@/components/ui/StatsStrip";
import ScrollCue from "@/components/ui/ScrollCue";

// ─── Animation variants ────────────────────────────────────────────────────────
const EASE = [0.16, 1, 0.3, 1] as const;

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6 } },
};

interface HeroProps {
  onStart: () => void;
}

export default function Hero({ onStart }: HeroProps) {
  return (
    <section className="relative min-h-[92dvh] flex flex-col items-center justify-center text-center py-24 -mx-4 md:-mx-8 px-4 md:px-8">
      <GridBackground />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center gap-7 max-w-3xl"
      >
        <LiveBadge />

        <motion.h1
          variants={fadeUp}
          className="text-[clamp(2.4rem,6vw,4.5rem)] font-bold tracking-[-0.035em] leading-[1.05]
                     text-(--text)"
        >
          Detect mental health{" "}
          <br className="hidden sm:block" />
          <span
            className="text-transparent bg-clip-text"
            style={{
              backgroundImage:
                "linear-gradient(135deg, var(--accent) 0%, #818cf8 100%)",
            }}
          >
            signals
          </span>{" "}
          in seconds.
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="text-base md:text-lg text-(--text-secondary) max-w-xl leading-relaxed"
        >
          MindTrack AI analyzes social media posts using explainable AI —
          giving researchers, clinicians, and safety teams actionable insights
          they can actually trust.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Button
            onClick={onStart}
            size="lg"
            icon={<ArrowRight size={16} />}
            iconPosition="right"
          >
            Start analyzing
          </Button>
          <Button variant="secondary" size="lg">
            View demo
          </Button>
        </motion.div>

        <motion.div
          variants={fadeIn}
          className="w-px h-10 bg-(--border)"
          aria-hidden
        />

        <StatsStrip />
      </motion.div>

      <ScrollCue />
    </section>
  );
}