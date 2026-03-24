"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";

interface AuthFormWrapperProps {
  children: React.ReactNode;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  loading: boolean;
  submitText: string;
  loadingText?: string;
  switchText: string;
  switchLink: string;
  switchLinkText: string;
  showDivider?: boolean;
}

const EASE = [0.16, 1, 0.3, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const field: Variants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

export default function AuthFormWrapper({
  children,
  onSubmit,
  loading,
  submitText,
  loadingText = "Loading…",
  switchText,
  switchLink,
  switchLinkText,
  showDivider = true,
}: AuthFormWrapperProps) {
  return (
    <motion.form
      onSubmit={onSubmit}
      noValidate
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      {children}

      {/* Submit button */}
      <motion.div variants={field}>
        <Button
          type="submit"
          size="lg"
          loading={loading}
          className="w-full"
        >
          {loading ? loadingText : submitText}
        </Button>
      </motion.div>

      {/* Divider */}
      {showDivider && (
        <motion.div variants={field} className="flex items-center gap-3">
          <div className="flex-1 h-px bg-(--border)" />
          <span
            className="text-[11px] text-(--text-muted) uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            or
          </span>
          <div className="flex-1 h-px bg-(--border)" />
        </motion.div>
      )}

      {/* Switch link */}
      <motion.p
        variants={field}
        className="text-center text-sm text-(--text-secondary)"
      >
        {switchText}{" "}
        <Link
          href={switchLink}
          className="text-(--accent) font-medium hover:underline underline-offset-4 transition-all"
        >
          {switchLinkText}
        </Link>
      </motion.p>
    </motion.form>
  );
}