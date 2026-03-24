"use client";

import { motion, type Variants } from "framer-motion";
import { clsx } from "clsx";
import Badge from "@/components/ui/Badge";

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  tag: string;
  index: number;
}

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  tag,
  index,
}: FeatureCardProps) {
  const isPrimary = index === 0;

  return (
    <motion.div
      variants={cardVariant}
      className={clsx(
        "group relative rounded-lg p-6 border transition-all duration-300",
        "hover:border-(--border-active) hover:shadow-(--shadow-glow)",
        isPrimary
          ? "bg-(--accent-dim) border-(--border-active)"
          : "bg-(--surface) border-(--border)"
      )}
    >
      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100
                   transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.06) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 space-y-4">
        <div className="flex items-start justify-between">
          <div
            className={clsx(
              "size-10 rounded-md flex items-center justify-center",
              isPrimary
                ? "bg-(--accent) text-[#080c10] shadow-[0_0_16px_var(--accent-glow)]"
                : "bg-(--surface-raised) text-(--accent) border border-(--border)"
            )}
          >
            <Icon size={18} />
          </div>
          <Badge variant={isPrimary ? "accent" : "default"}>{tag}</Badge>
        </div>

        <div className="space-y-1.5">
          <h3 className="font-semibold text-(--text) tracking-[-0.01em]">
            {title}
          </h3>
          <p className="text-sm text-(--text-secondary) leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}