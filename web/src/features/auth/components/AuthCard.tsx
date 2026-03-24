"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Brain } from "lucide-react";
import { AUTH_PANEL_STATS, AUTH_PANEL_QUOTE } from "@/constants/auth";

// ─── Animation ────────────────────────────────────────────────────────────────
const EASE = [0.16, 1, 0.3, 1] as const;

const panelVariants: Variants = {
  hidden: { opacity: 0, x: -24 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};

const formVariants: Variants = {
  hidden: { opacity: 0, x: 24 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};

// ─── Left decorative panel ────────────────────────────────────────────────────
function DecorativePanel() {
  return (
    <motion.div
      variants={panelVariants}
      className="hidden lg:flex flex-col justify-between
                 w-[420px] shrink-0 relative overflow-hidden
                 bg-[var(--surface)] border-r border-[var(--border)]
                 p-10"
    >
      {/* Dot grid */}
      <div className="absolute inset-0 bg-grid opacity-100" aria-hidden />

      {/* Accent orbs */}
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(6,182,212,0.12) 0%, transparent 70%)",
        }}
        aria-hidden
      />
      <div
        className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(129,140,248,0.08) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      {/* Brand */}
      <div className="relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div
            className="size-8 rounded-lg bg-[var(--accent)] flex items-center justify-center"
            style={{ boxShadow: "0 0 20px var(--accent-glow)" }}
          >
            <Brain size={16} className="text-[#080c10]" />
          </div>
          <span className="font-semibold text-sm tracking-[-0.02em] text-[var(--text)]">
            MindTrack<span className="text-[var(--accent)]">AI</span>
          </span>
        </Link>
      </div>

      {/* Middle */}
      <div className="relative z-10 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {AUTH_PANEL_STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[var(--radius-md)] bg-[var(--surface-raised)]
                         border border-[var(--border)] p-3 text-center"
            >
              <div
                className="text-xl font-bold text-[var(--text)] tracking-tight"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {stat.value}
              </div>
              <div
                className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mt-0.5"
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Quote */}
        <blockquote
          className="rounded-[var(--radius-lg)] bg-[var(--accent-dim)]
                     border border-[var(--border-active)] p-5 space-y-3"
        >
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic">
            &ldquo;{AUTH_PANEL_QUOTE.text}&rdquo;
          </p>
          <footer className="flex items-center gap-2.5">
            <div
              className="size-7 rounded-full bg-[var(--accent)] flex items-center justify-center
                         text-[#080c10] text-[10px] font-bold shrink-0"
            >
              M
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--text)]">
                {AUTH_PANEL_QUOTE.author}
              </div>
              <div className="text-[10px] text-[var(--text-muted)]">
                {AUTH_PANEL_QUOTE.role}
              </div>
            </div>
          </footer>
        </blockquote>

        {/* Decorative horizontal rule with label */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span
            className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Trusted by researchers
          </span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        {/* Avatar stack — decorative */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {["#06b6d4", "#818cf8", "#10b981", "#f59e0b"].map((color, i) => (
              <div
                key={i}
                className="size-7 rounded-full border-2 border-[var(--surface)] flex items-center justify-center
                           text-[9px] font-bold text-[#080c10]"
                style={{ background: color }}
              >
                {["DR", "KL", "MP", "SJ"][i]}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">
            +240 researchers this month
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10">
        <p className="text-[11px] text-[var(--text-muted)]">
          © {new Date().getFullYear()} MindTrack AI. All rights reserved.
        </p>
      </div>
    </motion.div>
  );
}

// ─── Right form panel ─────────────────────────────────────────────────────────
interface FormPanelProps {
  heading:    string;
  subheading: string;
  children:   React.ReactNode;
}

function FormPanel({ heading, subheading, children }: FormPanelProps) {
  return (
    <motion.div
      variants={formVariants}
      className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16 min-h-screen"
    >
      <div className="w-full max-w-sm space-y-8">
        {/* Mobile brand mark — hidden on lg where the panel shows it */}
        <Link href="/" className="inline-flex items-center gap-2 lg:hidden">
          <div
            className="size-7 rounded-lg bg-[var(--accent)] flex items-center justify-center"
            style={{ boxShadow: "0 0 14px var(--accent-glow)" }}
          >
            <Brain size={13} className="text-[#080c10]" />
          </div>
          <span className="font-semibold text-sm text-[var(--text)]">
            MindTrack<span className="text-[var(--accent)]">AI</span>
          </span>
        </Link>

        {/* Heading block */}
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-[-0.03em] text-[var(--text)]">
            {heading}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">{subheading}</p>
        </div>

        {/* Slot for form */}
        {children}
      </div>
    </motion.div>
  );
}

// ─── AuthCard shell ───────────────────────────────────────────────────────────
interface AuthCardProps {
  heading:    string;
  subheading: string;
  children:   React.ReactNode;
}

export default function AuthCard({ heading, subheading, children }: AuthCardProps) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      className="flex min-h-screen bg-[var(--bg)]"
    >
      <DecorativePanel />
      <FormPanel heading={heading} subheading={subheading}>
        {children}
      </FormPanel>
    </motion.div>
  );
}