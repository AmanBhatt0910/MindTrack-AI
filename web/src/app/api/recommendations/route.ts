import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Analysis } from "@/models/Analysis";
import { getUserIdFromRequest } from "@/lib/auth";

interface RecommendationItem {
  id: string;
  type: string;
  title: string;
  description: string;
  action?: string;
  icon: string;
  trigger: string;
  priority: number;
}

// Rule engine — condition → recommendation
function generateRecommendations(context: {
  latestProbabilities: Record<string, number>;
  recentLabels: string[];
  hour: number;
  entryCount: number;
}): RecommendationItem[] {
  const recs: RecommendationItem[] = [];
  const { latestProbabilities, recentLabels, hour } = context;

  // High stress
  if ((latestProbabilities.Stress || 0) > 0.5) {
    recs.push({
      id: "breathing-478",
      type: "breathing",
      title: "4-7-8 Breathing Technique",
      description:
        "Inhale for 4 seconds, hold for 7, exhale slowly for 8. This activates your parasympathetic nervous system and reduces stress hormones.",
      action: "Try now",
      icon: "🌬️",
      trigger: "High stress detected",
      priority: 1,
    });
    recs.push({
      id: "muscle-relax",
      type: "exercise",
      title: "Progressive Muscle Relaxation",
      description:
        "Tense each muscle group for 5 seconds, then release. Start from your toes and work up to your head.",
      action: "Start exercise",
      icon: "💪",
      trigger: "High stress detected",
      priority: 2,
    });
  }

  // High anxiety
  if ((latestProbabilities.Anxiety || 0) > 0.5) {
    recs.push({
      id: "grounding-54321",
      type: "exercise",
      title: "5-4-3-2-1 Grounding Exercise",
      description:
        "Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. This brings you back to the present moment.",
      action: "Try now",
      icon: "🌍",
      trigger: "High anxiety detected",
      priority: 1,
    });
    recs.push({
      id: "box-breathing",
      type: "breathing",
      title: "Box Breathing",
      description:
        "Breathe in for 4 seconds, hold for 4, breathe out for 4, hold for 4. Used by Navy SEALs to stay calm under pressure.",
      action: "Try now",
      icon: "📦",
      trigger: "High anxiety detected",
      priority: 2,
    });
  }

  // Depression detected
  if ((latestProbabilities.Depression || 0) > 0.5) {
    recs.push({
      id: "gentle-walk",
      type: "exercise",
      title: "Take a Gentle Walk",
      description:
        "Even a 10-minute walk can boost serotonin and improve your mood. Go outside if possible — sunlight helps too.",
      action: "Set a reminder",
      icon: "🚶",
      trigger: "Depression signals detected",
      priority: 1,
    });
    recs.push({
      id: "mood-music",
      type: "music",
      title: "Mood-Boosting Playlist",
      description:
        "Listening to music you enjoy releases dopamine. Try putting on your favorite uplifting songs.",
      action: "Open music",
      icon: "🎵",
      trigger: "Depression signals detected",
      priority: 2,
    });
    recs.push({
      id: "gratitude-journal",
      type: "journal",
      title: "Gratitude Journaling",
      description:
        "Write down 3 things you're grateful for, no matter how small. This practice rewires your brain toward positivity over time.",
      action: "Start journaling",
      icon: "📝",
      trigger: "Depression signals detected",
      priority: 3,
    });
  }

  // Late night usage
  if (hour >= 23 || hour < 5) {
    recs.push({
      id: "sleep-hygiene",
      type: "sleep",
      title: "Time to Wind Down",
      description:
        "It's late — good sleep is crucial for mental health. Try dimming lights, putting away screens, and doing a brief relaxation exercise.",
      action: "Sleep tips",
      icon: "🌙",
      trigger: "Late night activity",
      priority: 1,
    });
  }

  // Negative streak (3+ recent non-Normal labels)
  const negativeLabels = recentLabels.filter((l) => l !== "Normal" && l !== "Neutral");
  if (negativeLabels.length >= 3) {
    recs.push({
      id: "professional-help",
      type: "professional",
      title: "Consider Professional Support",
      description:
        "You've been dealing with difficult emotions recently. Talking to a mental health professional can provide tools and strategies tailored to you.",
      action: "Find a counselor",
      icon: "🤝",
      trigger: "Negative pattern detected over multiple days",
      priority: 1,
    });
    recs.push({
      id: "social-connect",
      type: "social",
      title: "Reach Out to Someone",
      description:
        "Social connection is a powerful antidote to difficult emotions. Consider calling a friend or family member you trust.",
      action: "Call someone",
      icon: "📱",
      trigger: "Negative pattern detected",
      priority: 2,
    });
  }

  // Positive mood — celebrate!
  const allNormal = recentLabels.length > 0 && recentLabels.every(
    (l) => l === "Normal" || l === "Neutral"
  );
  if (allNormal && context.entryCount > 3) {
    recs.push({
      id: "celebrate",
      type: "celebrate",
      title: "You're Doing Great! 🎉",
      description:
        "Your recent analyses show positive patterns. Keep up the good work — maintain your healthy routines and self-care practices.",
      icon: "🌟",
      trigger: "Positive streak detected",
      priority: 3,
    });
  }

  return recs.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get recent analyses (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentAnalyses = await Analysis.find({
      userId,
      createdAt: { $gte: sevenDaysAgo },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Build context
    const latest = recentAnalyses[0];
    const latestProbabilities: Record<string, number> = {};
    if (latest?.mlData?.probabilities) {
      const probs = latest.mlData.probabilities as Map<string, number> | Record<string, number>;
      if (probs instanceof Map) {
        probs.forEach((v: number, k: string) => { latestProbabilities[k] = v; });
      } else {
        Object.entries(probs).forEach(([k, v]) => { latestProbabilities[k] = v as number; });
      }
    }

    const recentLabels = recentAnalyses.map(
      (a) => (a.prediction as string) || "Normal"
    );

    const hour = new Date().getHours();

    const recommendations = generateRecommendations({
      latestProbabilities,
      recentLabels,
      hour,
      entryCount: recentAnalyses.length,
    });

    const latestEmotion = latest?.prediction || "neutral";

    return NextResponse.json({
      recommendations,
      basedOn: {
        latestEmotion,
        moodScore: null,
        timeOfDay: hour >= 23 || hour < 5 ? "night" : hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening",
        streakType: recentLabels.length >= 3 && recentLabels.slice(0, 3).every((l) => l !== "Normal" && l !== "Neutral") ? "negative" : null,
      },
    });
  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
