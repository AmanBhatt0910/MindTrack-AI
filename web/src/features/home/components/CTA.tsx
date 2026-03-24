"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { CTA_HEADLINE, CTA_SUBLINE } from "@/constants/home";

function GitHubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

export default function CTA({ onStart }: { onStart: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-xl overflow-hidden
                   border border-(--border-active)
                   bg-(--accent-dim)
                   p-12 md:p-20 text-center"
      >
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% -20%, rgba(6,182,212,0.18) 0%, transparent 65%)",
          }}
          aria-hidden
        />

        {/* Dot grid */}
        <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />

        {/* Content */}
        <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
          <h2
            className="text-[clamp(1.8rem,4vw,3rem)] font-bold tracking-[-0.03em]
                       text-(--text) leading-tight"
          >
            {CTA_HEADLINE}
          </h2>
          <p className="text-(--text-secondary) text-base leading-relaxed">
            {CTA_SUBLINE}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              onClick={onStart}
              size="lg"
              icon={<ArrowRight size={16} />}
              iconPosition="right"
            >
              Start for free
            </Button>
            <Button
              variant="secondary"
              size="lg"
              icon={<GitHubIcon size={16} />}
            >
              View on GitHub
            </Button>
          </div>

          <p className="text-xs text-(--text-muted)">
            No credit card required · Cancel any time
          </p>
        </div>
      </motion.div>
    </section>
  );
}