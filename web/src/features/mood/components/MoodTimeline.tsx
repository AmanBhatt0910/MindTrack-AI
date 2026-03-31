"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useMoodStore } from "../store/useMoodStore";
import { useTranslation } from "@/hooks/useTranslation";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { mood: string; note: string } }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div
      className="rounded-[var(--radius-md)] border border-[var(--border)] p-3 text-xs space-y-1"
      style={{ background: "var(--surface-raised)" }}
    >
      <p className="text-[var(--text-secondary)] font-medium">{label}</p>
      <p className="text-[var(--accent)] font-bold">Score: {entry.value}/10</p>
      <p className="text-[var(--text-muted)]">{entry.payload.mood}</p>
      {entry.payload.note && (
        <p className="text-[var(--text-muted)] max-w-[160px] truncate italic">
          &ldquo;{entry.payload.note}&rdquo;
        </p>
      )}
    </div>
  );
}

const MOOD_EMOJIS: Record<string, string> = {
  Happy: "😊",
  Grateful: "🙏",
  Hopeful: "✨",
  Calm: "🌊",
  Exhausted: "😴",
  Anxious: "😰",
  Sad: "😢",
  Angry: "😤",
};

export default function MoodTimeline() {
  const { entries } = useMoodStore();
  const { t } = useTranslation();

  if (entries.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 flex flex-col items-center justify-center gap-3 text-center">
        <span className="text-4xl">📊</span>
        <p className="text-sm text-[var(--text-muted)] max-w-xs">{t("noMoodHistory")}</p>
      </div>
    );
  }

  // Prepare last 14 days of chart data
  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const chartData = sorted.slice(-14).map((e) => ({
    day: new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    score: e.score,
    mood: e.mood,
    note: e.note,
  }));

  // Trend analysis
  const recent = sorted.slice(-7);
  const older = sorted.slice(-14, -7);
  const recentAvg =
    recent.length > 0 ? recent.reduce((s, e) => s + e.score, 0) / recent.length : 0;
  const olderAvg =
    older.length > 0 ? older.reduce((s, e) => s + e.score, 0) / older.length : recentAvg;

  const trend = recentAvg > olderAvg + 0.5 ? "up" : recentAvg < olderAvg - 0.5 ? "down" : "stable";
  const trendLabel =
    trend === "up" ? t("trendImproving") : trend === "down" ? t("trendDeclining") : t("trendStable");
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-[var(--text-muted)]";

  // Weekly average
  const weeklyAvg = recent.length > 0 ? recentAvg.toFixed(1) : "—";

  // Streak calculation
  let streak = 0;
  const daysWithEntries = new Set(
    entries.map((e) => new Date(e.date).toDateString())
  );
  let checkDate = new Date();
  while (daysWithEntries.has(checkDate.toDateString())) {
    streak++;
    const prev = new Date(checkDate);
    prev.setDate(prev.getDate() - 1);
    checkDate = prev;
  }

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: t("weeklyAvg"),
            value: weeklyAvg,
            sub: t("moodScore"),
            color: "text-[var(--accent)]",
          },
          {
            label: t("moodStreak"),
            value: streak.toString(),
            sub: streak === 1 ? "day" : "days",
            color: "text-amber-400",
          },
          {
            label: t("entries"),
            value: entries.length.toString(),
            sub: t("total"),
            color: "text-violet-400",
          },
        ].map(({ label, value, sub, color }) => (
          <div
            key={label}
            className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 text-center"
          >
            <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-[11px] text-[var(--text-muted)]">{sub}</p>
          </div>
        ))}
      </div>

      {/* Trend badge */}
      <div className="flex items-center gap-2">
        <TrendIcon size={14} className={trendColor} />
        <span className={`text-xs font-medium ${trendColor}`}>{trendLabel}</span>
        <span className="text-xs text-[var(--text-muted)]">{t("vsPreviousWeek")}</span>
      </div>

      {/* Line chart */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[var(--text)]">{t("moodTimeline")}</h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{t("yourMoodThisWeek")}</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid
              vertical={false}
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="4 4"
            />
            <XAxis
              dataKey="day"
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={24}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={5} stroke="rgba(255,255,255,0.07)" strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--accent)"
              strokeWidth={2}
              dot={{ fill: "var(--accent)", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "var(--accent)", strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent entries list */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)]">
        <div className="px-5 py-3">
          <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            {t("moodHistory")}
          </h3>
        </div>
        {entries.slice(0, 10).map((entry) => (
          <div key={entry.id} className="flex items-center gap-3 px-5 py-3">
            <span className="text-xl shrink-0">{MOOD_EMOJIS[entry.mood] ?? "🙂"}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--text)]">{entry.mood}</span>
                <span className="text-xs text-[var(--text-muted)]">
                  {new Date(entry.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {entry.note && (
                <p className="text-xs text-[var(--text-muted)] truncate mt-0.5 italic">
                  &ldquo;{entry.note}&rdquo;
                </p>
              )}
            </div>
            <div className="shrink-0">
              <span
                className="inline-flex items-center justify-center size-7 rounded-full text-xs font-bold"
                style={{
                  background: `hsl(${(entry.score / 10) * 120}, 60%, 25%)`,
                  color: `hsl(${(entry.score / 10) * 120}, 80%, 70%)`,
                }}
              >
                {entry.score}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
