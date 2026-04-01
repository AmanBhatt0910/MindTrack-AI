import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Analysis } from "@/models/Analysis";
import { EmotionSnapshot } from "@/models/EmotionSnapshot";
import { getUserIdFromRequest } from "@/lib/auth";

// Backfill EmotionSnapshot from existing Analysis records
export async function POST(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const analyses = await Analysis.find({ userId }).sort({ createdAt: 1 }).lean();

    let processed = 0;

    for (const analysis of analyses) {
      const date = new Date(analysis.createdAt as string);
      date.setHours(0, 0, 0, 0);

      const probabilities = analysis.mlData?.probabilities as Record<string, number> | undefined;
      if (!probabilities) continue;

      // Normalize keys to lowercase
      const scores: Record<string, number> = {};
      for (const [key, val] of Object.entries(probabilities)) {
        scores[key.toLowerCase()] = val as number;
      }

      const overall =
        (scores.anxiety || 0) * 0.25 +
        (scores.stress || 0) * 0.25 +
        (scores.depression || 0) * 0.3 +
        (scores.bipolar || 0) * 0.2;

      // Upsert — update if same user+date exists, otherwise create
      await EmotionSnapshot.findOneAndUpdate(
        { userId, date },
        {
          $set: {
            sentimentScores: {
              anxiety: scores.anxiety || 0,
              stress: scores.stress || 0,
              depression: scores.depression || 0,
              bipolar: scores.bipolar || 0,
              overall: Math.round(overall * 1000) / 1000,
            },
            source: "analysis",
          },
          $inc: { entryCount: 1 },
        },
        { upsert: true, new: true }
      );

      processed++;
    }

    return NextResponse.json({ processed, message: `Backfilled ${processed} records` });
  } catch (error) {
    console.error("Backfill error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
