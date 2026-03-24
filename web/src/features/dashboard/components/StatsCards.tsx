"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { clsx } from "clsx";
import { STATS } from "@/constants/dashboard";

// ─── Color token map ──────────────────────────────────────────────────────────
const colorMap = {
  accent:  { bg: "bg-[var(--accent-dim)]",      border: "border-[var(--border-active)]", text: "text-[var(--accent)]"  },
  danger:  { bg: "bg-red-500/8",                border: "border-red-500/20",             text: "text-red-400"          },
  warning: { bg: "bg-amber-500/8",              border: "border-amber-500/20",           text: "text-amber-400"        },
  success: { bg: "bg-emerald-500/8",            border: "border-emerald-500/20",         text: "text-emerald-400"      },
} as const;

export default function StatsCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map((stat) => {
        const colors = colorMap[stat.color];
        return (
          <div
            key={stat.label}
            className={clsx(
              "rounded-[var(--radius-lg)] p-5 border",
              "bg-[var(--surface)] border-[var(--border)]",
              "hover:border-[var(--border-active)] transition-colors duration-200"
            )}
          >
            {/* Label */}
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3"
               style={{ fontFamily: "var(--font-mono)" }}>
              {stat.label}
            </p>

            {/* Value */}
            <p className={clsx("text-3xl font-bold tracking-tight", colors.text)}
               style={{ fontFamily: "var(--font-mono)" }}>
              {stat.value}
            </p>

            {/* Trend */}
            <div className="flex items-center gap-1 mt-2">
              {stat.up === true  && <TrendingUp  size={11} className="text-emerald-400 shrink-0" />}
              {stat.up === false && <TrendingDown size={11} className="text-red-400     shrink-0" />}
              {stat.up === null  && <Minus        size={11} className="text-[var(--text-muted)] shrink-0" />}
              <span className="text-[11px] text-[var(--text-muted)]">{stat.trend}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}