"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "@/hooks/useTranslation";
import { analyticsService } from "../services/analytics.service";
import { TrendsResponse, TimeRange } from "../types/analytics.types";

const CATEGORY_COLORS: Record<string, string> = {
  anxiety: "#f59e0b",
  stress: "#8b5cf6",
  depression: "#ef4444",
  bipolar: "#3b82f6",
  overall: "#06b6d4",
};

const RANGE_OPTIONS: { value: TimeRange; labelKey: string }[] = [
  { value: "7d", labelKey: "last7Days" },
  { value: "30d", labelKey: "last30Days" },
  { value: "90d", labelKey: "last90Days" },
];

export default function TrendChart() {
  const { t } = useTranslation();
  const [data, setData] = useState<TrendsResponse | null>(null);
  const [range, setRange] = useState<TimeRange>("7d");
  const [showMovingAvg, setShowMovingAvg] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await analyticsService.getTrends(range);
        setData(result);
      } catch (err) {
        console.error("Failed to load analytics data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [range]);

  if (loading) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse text-[var(--text-muted)]">{t("loading")}</div>
        </div>
      </div>
    );
  }

  if (!data || data.daily.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
        <p className="text-sm text-[var(--text-muted)]">{t("noAnalyticsData")}</p>
      </div>
    );
  }

  const chartData = showMovingAvg ? data.movingAvg : data.daily;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="size-1.5 rounded-full bg-[var(--accent)] pulse-dot" />
          <h3 className="text-sm font-semibold text-[var(--text)]">
            {t("emotionTrends")}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Moving average toggle */}
          <button
            onClick={() => setShowMovingAvg(!showMovingAvg)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              showMovingAvg
                ? "bg-[var(--accent-dim)] text-[var(--accent)]"
                : "bg-[var(--surface-raised)] text-[var(--text-secondary)] hover:bg-[var(--surface-raised)]"
            }`}
          >
            {t("movingAverage")}
          </button>

          {/* Range selector */}
          <div className="flex rounded-md border border-[var(--border)] overflow-hidden">
            {RANGE_OPTIONS.map(({ value, labelKey }) => (
              <button
                key={value}
                onClick={() => setRange(value)}
                className={`px-3 py-1.5 text-xs font-medium transition-all ${
                  range === value
                    ? "bg-[var(--accent)] text-[#080c10]"
                    : "bg-[var(--surface-raised)] text-[var(--text-secondary)] hover:bg-[var(--surface-raised)]"
                }`}
              >
                {t(labelKey as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              {Object.entries(CATEGORY_COLORS).map(([key, color]) => (
                <linearGradient
                  key={key}
                  id={`gradient-${key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "var(--text-muted)" }}
              tickFormatter={(v) => {
                const d = new Date(v);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--text-muted)" }}
              domain={[0, 1]}
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                fontSize: 12,
                color: "var(--text)",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [`${(Number(value ?? 0) * 100).toFixed(1)}%`]}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: "var(--text-secondary)" }}
            />
            {Object.entries(CATEGORY_COLORS)
              .filter(([k]) => k !== "overall")
              .map(([key, color]) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#gradient-${key})`}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2 }}
                />
              ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Spikes */}
      {data.spikes.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--text-muted)]">
            ⚠️ {t("spikeDetected")}
          </p>
          <div className="flex flex-wrap gap-2">
            {data.spikes.map((spike, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20"
              >
                {spike.category} +{(spike.delta * 100).toFixed(0)}% on{" "}
                {new Date(spike.date).toLocaleDateString()}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
