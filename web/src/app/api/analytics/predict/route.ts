import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { EmotionSnapshot } from "@/models/EmotionSnapshot";
import { getUserIdFromRequest } from "@/lib/auth";

// Simple linear regression
function linearRegression(data: number[]): { slope: number; intercept: number } {
  const n = data.length;
  if (n === 0) return { slope: 0, intercept: 0 };

  const xMean = (n - 1) / 2;
  const yMean = data.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (data[i] - yMean);
    denominator += (i - xMean) * (i - xMean);
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;

  return { slope, intercept };
}

function predict(
  data: number[],
  daysAhead: number
): { predicted: number; lower: number; upper: number }[] {
  const { slope, intercept } = linearRegression(data);
  const n = data.length;

  // Standard error
  const residuals = data.map((y, i) => y - (slope * i + intercept));
  const se = Math.sqrt(
    residuals.reduce((sum, r) => sum + r * r, 0) / Math.max(n - 2, 1)
  );

  const predictions = [];
  for (let d = 1; d <= daysAhead; d++) {
    const x = n + d - 1;
    const pred = Math.max(0, Math.min(1, slope * x + intercept));
    const margin = se * 1.96; // 95% CI
    predictions.push({
      predicted: Math.round(pred * 1000) / 1000,
      lower: Math.max(0, Math.round((pred - margin) * 1000) / 1000),
      upper: Math.min(1, Math.round((pred + margin) * 1000) / 1000),
    });
  }

  return predictions;
}

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get last 14 days of data for prediction
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 14);

    const snapshots = await EmotionSnapshot.find({
      userId,
      date: { $gte: startDate },
    })
      .sort({ date: 1 })
      .lean();

    if (snapshots.length < 3) {
      return NextResponse.json({
        predictions: [],
        confidence: 0,
        basedOnDays: snapshots.length,
        message: "Need at least 3 data points for prediction",
      });
    }

    const categories = ["anxiety", "stress", "depression", "bipolar"];
    const daysAhead = 3;
    const today = new Date();

    const allPredictions = [];

    for (const cat of categories) {
      const values = snapshots.map((s: Record<string, unknown>) => {
        const scores = s.sentimentScores as Record<string, number> | undefined;
        return scores?.[cat] ?? 0;
      });

      const preds = predict(values, daysAhead);

      for (let d = 0; d < daysAhead; d++) {
        const predDate = new Date(today);
        predDate.setDate(predDate.getDate() + d + 1);

        allPredictions.push({
          date: predDate.toISOString().split("T")[0],
          category: cat,
          ...preds[d],
        });
      }
    }

    // Confidence is higher with more data points
    const confidence = Math.min(
      Math.round((snapshots.length / 14) * 100),
      95
    );

    return NextResponse.json({
      predictions: allPredictions,
      confidence,
      basedOnDays: snapshots.length,
    });
  } catch (error) {
    console.error("Analytics predict error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
