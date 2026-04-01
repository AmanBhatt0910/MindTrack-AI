import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Analysis } from "@/models/Analysis";
import { getUserIdFromRequest } from "@/lib/auth";

interface SuggestionItem {
  id: string;
  message: string;
  emoji: string;
  type: string;
  priority: number;
}

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get last 5 analyses
    const recentAnalyses = await Analysis.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const suggestions: SuggestionItem[] = [];
    const hour = new Date().getHours();

    // Check latest analysis for high stress/anxiety
    if (recentAnalyses.length > 0) {
      const latest = recentAnalyses[0];
      const probs = latest.mlData?.probabilities as Map<string, number> | Record<string, number> | undefined;
      
      let stressScore = 0;
      let anxietyScore = 0;
      
      if (probs) {
        if (probs instanceof Map) {
          stressScore = probs.get("Stress") || 0;
          anxietyScore = probs.get("Anxiety") || 0;
        } else {
          stressScore = (probs as Record<string, number>).Stress || 0;
          anxietyScore = (probs as Record<string, number>).Anxiety || 0;
        }
      }

      if (stressScore > 0.5) {
        suggestions.push({
          id: "high-stress-breath",
          message: "Your recent analysis shows elevated stress. Take a moment for a deep breath — inhale 4s, hold 4s, exhale 4s.",
          emoji: "🌬️",
          type: "breathing",
          priority: 1,
        });
      }

      if (anxietyScore > 0.5) {
        suggestions.push({
          id: "high-anxiety-ground",
          message: "Feeling anxious? Try the grounding technique: notice 5 things you can see, 4 you can touch, 3 you hear.",
          emoji: "🌿",
          type: "mindfulness",
          priority: 1,
        });
      }
    }

    // Negative sentiment streak
    const negativeCount = recentAnalyses.filter(
      (a) => a.prediction !== "Neutral" && a.prediction !== "Normal"
    ).length;

    if (negativeCount >= 3) {
      suggestions.push({
        id: "negative-streak-break",
        message: "You've had some tough days recently. Consider stepping away for 5 minutes — a short break can change your perspective.",
        emoji: "🚶",
        type: "break",
        priority: 1,
      });
    }

    // Late night
    if (hour >= 23 || hour < 5) {
      suggestions.push({
        id: "late-night-sleep",
        message: "It's getting late. Quality sleep is one of the best things you can do for your mental health. Consider winding down.",
        emoji: "🌙",
        type: "sleep",
        priority: 2,
      });
    }

    // General hydration (low priority, always applicable)
    if (suggestions.length === 0) {
      suggestions.push({
        id: "general-hydrate",
        message: "Remember to stay hydrated and take regular breaks. Small habits make a big difference!",
        emoji: "💧",
        type: "hydration",
        priority: 3,
      });
    }

    return NextResponse.json({
      suggestions: suggestions.sort((a, b) => a.priority - b.priority).slice(0, 2),
      context: {
        stressLevel: 0,
        streak: negativeCount,
        timeOfDay: hour >= 23 || hour < 5 ? "night" : hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening",
      },
    });
  } catch (error) {
    console.error("Suggestions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
