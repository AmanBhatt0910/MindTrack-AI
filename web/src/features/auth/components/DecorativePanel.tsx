"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Brain } from "lucide-react";
import { AUTH_PANEL_STATS, AUTH_PANEL_QUOTE } from "@/constants/auth";

const EASE = [0.16, 1, 0.3, 1] as const;

const panelVariants: Variants = {
  hidden: { opacity: 0, x: -24 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};

export default function DecorativePanel() {
  return (
    <motion.div
      variants={panelVariants}
      className="hidden lg:flex flex-col justify-between
                 w-105 shrink-0 relative overflow-hidden
                 bg-(--surface) border-r border-(--border)
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
            className="size-8 rounded-lg bg-(--accent) flex items-center justify-center"
            style={{ boxShadow: "0 0 20px var(--accent-glow)" }}
          >
            <Brain size={16} className="text-[#080c10]" />
          </div>
          <span className="font-semibold text-sm tracking-[-0.02em] text-(--text)">
            MindTrack<span className="text-(--accent)">AI</span>
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
              className="rounded-md bg-(--surface-raised)
                         border border-(--border) p-3 text-center"
            >
              <div
                className="text-xl font-bold text-(--text) tracking-tight"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {stat.value}
              </div>
              <div
                className="text-[10px] text-(--text-muted) uppercase tracking-widest mt-0.5"
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Quote */}
        <blockquote
          className="rounded-lg bg-(--accent-dim)
                     border border-(--border-active) p-5 space-y-3"
        >
          <p className="text-sm text-(--text-secondary) leading-relaxed italic">
            &ldquo;{AUTH_PANEL_QUOTE.text}&rdquo;
          </p>
          <footer className="flex items-center gap-2.5">
            <div
              className="size-7 rounded-full bg-(--accent) flex items-center justify-center
                         text-[#080c10] text-[10px] font-bold shrink-0"
            >
              M
            </div>
            <div>
              <div className="text-xs font-semibold text-(--text)">
                {AUTH_PANEL_QUOTE.author}
              </div>
              <div className="text-[10px] text-(--text-muted)">
                {AUTH_PANEL_QUOTE.role}
              </div>
            </div>
          </footer>
        </blockquote>

        {/* Decorative horizontal rule with label */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-(--border)" />
          <span
            className="text-[10px] text-(--text-muted) uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Trusted by researchers
          </span>
          <div className="flex-1 h-px bg-(--border)" />
        </div>

        {/* Avatar stack — decorative */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {["#06b6d4", "#818cf8", "#10b981", "#f59e0b"].map((color, i) => (
              <div
                key={i}
                className="size-7 rounded-full border-2 border-(--surface) flex items-center justify-center
                           text-[9px] font-bold text-[#080c10]"
                style={{ background: color }}
              >
                {["DR", "KL", "MP", "SJ"][i]}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-(--text-muted)">
            +240 researchers this month
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10">
        <p className="text-[11px] text-(--text-muted)">
          © {new Date().getFullYear()} MindTrack AI. All rights reserved.
        </p>
      </div>
    </motion.div>
  );
}