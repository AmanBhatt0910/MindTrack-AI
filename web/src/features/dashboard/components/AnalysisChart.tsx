"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CHART_DATA, CHART_COLORS } from "@/constants/dashboard";

// ─── Custom tooltip ───────────────────────────────────────────────────────────
interface TooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-[var(--radius-md)] border border-[var(--border)] p-3 text-xs space-y-1"
      style={{ background: "var(--surface-raised)", fontFamily: "var(--font-mono)" }}
    >
      <p className="text-[var(--text-secondary)] mb-2 font-medium">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="size-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-[var(--text-muted)]">{p.name}</span>
          <span className="text-[var(--text)] font-medium ml-auto pl-4">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Chart legend ─────────────────────────────────────────────────────────────
function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
      <span className="size-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

export default function AnalysisChart() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text)] tracking-[-0.01em]">
            Signal breakdown
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Analyses by category, last 7 days
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {(Object.entries(CHART_COLORS) as [string, string][]).map(([key, color]) => (
            <LegendDot key={key} color={color} label={key} />
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={CHART_DATA as unknown as Record<string, unknown>[]} barCategoryGap="30%" barGap={2}>
          <CartesianGrid
            vertical={false}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="day"
            tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
            axisLine={false}
            tickLine={false}
            width={24}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          {(Object.entries(CHART_COLORS) as [string, string][]).map(([key, color]) => (
            <Bar
              key={key}
              dataKey={key}
              fill={color}
              radius={[3, 3, 0, 0]}
              fillOpacity={0.85}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}