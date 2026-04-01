import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { EmotionSnapshot } from "@/models/EmotionSnapshot";
import { getUserIdFromRequest } from "@/lib/auth";

function parseRange(range: string): number {
  switch (range) {
    case "30d": return 30;
    case "90d": return 90;
    default: return 7;
  }
}

function computeMovingAverage(
  data: Array<Record<string, number>>,
  categories: string[],
  windowSize: number = 3
): Array<Record<string, number | string>> {
  const result: Array<Record<string, number | string>> = [];

  for (let i = 0; i < data.length; i++) {
    const entry: Record<string, number | string> = { date: data[i].date as unknown as string };
    for (const cat of categories) {
      const windowStart = Math.max(0, i - windowSize + 1);
      const windowSlice = data.slice(windowStart, i + 1);
      const avg =
        windowSlice.reduce((sum, d) => sum + (d[cat] || 0), 0) / windowSlice.length;
      entry[cat] = Math.round(avg * 1000) / 1000;
    }
    result.push(entry);
  }

  return result;
}

function detectSpikes(
  data: Array<Record<string, number | string>>,
  categories: string[],
  threshold: number = 0.3
) {
  const spikes: Array<{
    date: string;
    category: string;
    previousValue: number;
    currentValue: number;
    delta: number;
  }> = [];

  for (let i = 1; i < data.length; i++) {
    for (const cat of categories) {
      const prev = (data[i - 1][cat] as number) || 0;
      const curr = (data[i][cat] as number) || 0;
      const delta = curr - prev;
      if (delta > threshold) {
        spikes.push({
          date: data[i].date as string,
          category: cat,
          previousValue: prev,
          currentValue: curr,
          delta: Math.round(delta * 1000) / 1000,
        });
      }
    }
  }

  return spikes;
}

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "7d";
    const days = parseRange(range);

    await connectDB();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const snapshots = await EmotionSnapshot.find({
      userId,
      date: { $gte: startDate },
    })
      .sort({ date: 1 })
      .lean();

    // Build daily data
    const categories = ["anxiety", "stress", "depression", "bipolar"];
    const daily = snapshots.map((s: Record<string, unknown>) => {
      const scores = s.sentimentScores as Record<string, number> | undefined;
      return {
        date: new Date(s.date as string).toISOString().split("T")[0],
        anxiety: scores?.anxiety ?? 0,
        stress: scores?.stress ?? 0,
        depression: scores?.depression ?? 0,
        bipolar: scores?.bipolar ?? 0,
        overall: scores?.overall ?? 0,
        moodScore: (s.moodScore as number) ?? null,
        entryCount: (s.entryCount as number) ?? 1,
      };
    });

    // Moving averages
    const movingAvg = computeMovingAverage(
      daily as unknown as Array<Record<string, number>>,
      categories,
      3
    );

    // Spike detection
    const spikes = detectSpikes(
      daily as unknown as Array<Record<string, number | string>>,
      categories
    );

    // Summary
    const avgScores: Record<string, number> = {};
    for (const cat of categories) {
      const vals = daily.map((d) => d[cat as keyof typeof d] as number).filter((v) => v > 0);
      avgScores[cat] = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    }

    const dominantEmotion =
      Object.entries(avgScores).sort(([, a], [, b]) => b - a)[0]?.[0] || "neutral";

    // Determine trend
    let trend: "improving" | "stable" | "declining" = "stable";
    if (daily.length >= 3) {
      const recentAvg =
        daily.slice(-3).reduce((s, d) => s + d.overall, 0) / 3;
      const olderAvg =
        daily.slice(0, 3).reduce((s, d) => s + d.overall, 0) / 3;
      if (recentAvg < olderAvg - 0.1) trend = "improving";
      else if (recentAvg > olderAvg + 0.1) trend = "declining";
    }

    // Risk level
    const latestOverall = daily.length > 0 ? daily[daily.length - 1].overall : 0;
    const riskLevel =
      latestOverall > 0.6 ? "high" : latestOverall > 0.3 ? "moderate" : "low";

    const avgMoodScore =
      daily.filter((d) => d.moodScore !== null).length > 0
        ? daily
            .filter((d) => d.moodScore !== null)
            .reduce((s, d) => s + (d.moodScore ?? 0), 0) /
          daily.filter((d) => d.moodScore !== null).length
        : 0;

    return NextResponse.json({
      daily,
      movingAvg,
      spikes,
      summary: {
        dominantEmotion,
        trend,
        riskLevel,
        avgMoodScore: Math.round(avgMoodScore * 10) / 10,
        totalEntries: daily.reduce((s, d) => s + d.entryCount, 0),
      },
    });
  } catch (error) {
    console.error("Analytics trends error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
