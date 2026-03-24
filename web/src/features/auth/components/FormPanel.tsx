"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Brain } from "lucide-react";

interface FormPanelProps {
  heading: string;
  subheading: string;
  children: React.ReactNode;
}

const EASE = [0.16, 1, 0.3, 1] as const;

const formVariants: Variants = {
  hidden: { opacity: 0, x: 24 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};

export default function FormPanel({ heading, subheading, children }: FormPanelProps) {
  return (
    <motion.div
      variants={formVariants}
      className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16 min-h-screen"
    >
      <div className="w-full max-w-sm space-y-8">
        {/* Mobile brand mark — hidden on lg where the panel shows it */}
        <Link href="/" className="inline-flex items-center gap-2 lg:hidden">
          <div
            className="size-7 rounded-lg bg-(--accent) flex items-center justify-center"
            style={{ boxShadow: "0 0 14px var(--accent-glow)" }}
          >
            <Brain size={13} className="text-[#080c10]" />
          </div>
          <span className="font-semibold text-sm text-(--text)">
            MindTrack<span className="text-(--accent)">AI</span>
          </span>
        </Link>

        {/* Heading block */}
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-[-0.03em] text-(--text)">
            {heading}
          </h1>
          <p className="text-sm text-(--text-secondary)">{subheading}</p>
        </div>

        {/* Slot for form */}
        {children}
      </div>
    </motion.div>
  );
}