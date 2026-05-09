import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Analysis } from "@/models/Analysis";
import { EmotionSnapshot } from "@/models/EmotionSnapshot";
import { PatientDoctor } from "@/models/PatientDoctor";
import { Notification } from "@/models/Notification";
import { verifyToken } from "@/lib/auth";
import {
  analyzeJournalWithGemini,
  isHighRiskFromML,
  isHighRiskFromGemini,
  CRISIS_ESCALATION_MESSAGE,
  type GeminiInsight,
} from "@/lib/gemini";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface MLPrediction {
  label: string;
  confidence: number;
}

interface MLDataResponse {
  labels: string[];
  probabilities: Record<string, number>;
  label?: string;
  confidence?: number;
  all_predictions?: MLPrediction[];
  explanation?: string;
  raw_probs?: number[];
  error?: string;
  shapData?: {
    tokens: string[];
    scores: number[];
  };
  // Multilingual fields from enhanced backend
  language_info?: {
    language: string;
    confidence: number;
    script: string;
  };
  translation_info?: {
    original_text: string;
    analyzed_text: string;
    was_translated: boolean;
    source_lang: string | null;
  };
}

interface SavedAnalysis {
  userId: string;
  text: string;
  language: string;
  prediction: string;
  confidence: number;
  explanation: string[];
  mlData: {
    labels: string[];
    probabilities: Record<string, number>;
    allPredictions?: MLPrediction[];
    rawProbs?: number[];
    shapData?: {
      tokens: string[];
      scores: number[];
    };
  };
  // Gemini fallback fields
  geminiInsight?: {
    emotionalInsight: string;
    suggestedSupport: string[];
    riskLevel: string;
  };
  fallbackUsed: boolean;
  riskLevel: string;
  crisisEscalation: boolean;
  // Multilingual fields
  detectedLanguage?: string;
  wasTranslated?: boolean;
  originalText?: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const GEMINI_FALLBACK_THRESHOLD = parseFloat(
  process.env.GEMINI_FALLBACK_THRESHOLD || "0.6"
);

// ─── Helpers ────────────────────────────────────────────────────────────────────

async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  if (!token) return null;
  try {
    const decoded = verifyToken(token);
    if (typeof decoded === "string") return null;
    return decoded.id as string;
  } catch {
    return null;
  }
}

/**
 * Confidence & Fallback Engine
 * Decides when to trust the ML model vs trigger Gemini fallback.
 */
function shouldTriggerGeminiFallback(mlData: MLDataResponse): boolean {
  // Trigger if predicted label is "Normal"
  if (
    mlData.labels &&
    mlData.labels.length === 1 &&
    mlData.labels[0] === "Normal"
  ) {
    console.log("🔄 Gemini fallback: ML predicted 'Normal'");
    return true;
  }

  // Trigger if max probability is below threshold
  if (mlData.probabilities) {
    const maxProb = Math.max(...Object.values(mlData.probabilities));
    if (maxProb < GEMINI_FALLBACK_THRESHOLD) {
      console.log(
        `🔄 Gemini fallback: max confidence ${(maxProb * 100).toFixed(1)}% < ${(GEMINI_FALLBACK_THRESHOLD * 100).toFixed(1)}% threshold`
      );
      return true;
    }
  }

  return false;
}

/**
 * Determine the final risk level from ML data and optional Gemini insight.
 */
function determineFinalRiskLevel(
  mlData: MLDataResponse,
  geminiInsight?: GeminiInsight
): "Low" | "Medium" | "High" {
  // Check ML data for high risk
  if (isHighRiskFromML(mlData.probabilities || {})) {
    return "High";
  }

  // Check Gemini insight for high risk
  if (geminiInsight && isHighRiskFromGemini(geminiInsight)) {
    return "High";
  }

  // Check Gemini medium risk
  if (geminiInsight?.riskLevel === "Medium") {
    return "Medium";
  }

  // Check ML for moderate signals
  const probs = mlData.probabilities || {};
  const maxProb = Math.max(...Object.values(probs));
  if (maxProb > 0.4) {
    return "Medium";
  }

  return "Low";
}

// ─── POST Handler ───────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const { text, language } = await req.json();

    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const mlApiUrl = process.env.ML_API_URL;
    if (!mlApiUrl) {
      console.error("❌ ML_API_URL not configured in .env.local");
      return NextResponse.json(
        {
          error: "ML API URL not configured",
          prediction: "Error",
          confidence: 0,
          explanation: [
            "ML service is not configured. Set ML_API_URL in .env.local",
          ],
          mlData: null,
        },
        { status: 503 }
      );
    }

    console.log("📤 Sending to ML API:", {
      text: text.substring(0, 100),
      url: mlApiUrl,
    });

    // ─── STEP 1: Call ML API with auto-translate ────────────────────────────

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let mlResponse: Response;
    try {
      mlResponse = await fetch(`${mlApiUrl}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          auto_translate: language === "auto" || !language,
          source_lang: language !== "auto" ? language : undefined,
        }),
        signal: controller.signal,
      });
    } catch (fetchErr: unknown) {
      clearTimeout(timeoutId);
      const errMsg =
        fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      console.error("❌ Cannot reach ML API:", errMsg);
      return NextResponse.json(
        {
          error: `Cannot connect to ML service at ${mlApiUrl}. Is the model server running?`,
          prediction: "Error",
          confidence: 0,
          explanation: [
            `ML service unreachable: ${errMsg}. Make sure uvicorn is running from the model/ directory.`,
          ],
          mlData: null,
        },
        { status: 503 }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (!mlResponse.ok) {
      const errorText = await mlResponse.text();
      console.error("ML API error:", errorText);
      return NextResponse.json(
        {
          error: `ML API returned ${mlResponse.status}`,
          prediction: "Error",
          confidence: 0,
          explanation: [`ML service error: ${errorText}`],
          mlData: null,
        },
        { status: 502 }
      );
    }

    const mlData: MLDataResponse = await mlResponse.json();
    console.log("📥 ML API Response:", mlData);

    if (mlData.error) {
      console.error("ML API returned error:", mlData.error);
      return NextResponse.json({
        prediction: "Neutral",
        confidence: 0,
        explanation: ["Unable to analyze at this moment. Please try again."],
        mlData: null,
      });
    }

    // ─── STEP 2: Confidence Check & Gemini Fallback ─────────────────────────

    let geminiInsight: GeminiInsight | undefined;
    let fallbackUsed = false;

    if (shouldTriggerGeminiFallback(mlData)) {
      console.log("🤖 Triggering Gemini fallback analysis...");
      try {
        geminiInsight = await analyzeJournalWithGemini(text, {
          labels: mlData.labels,
          probabilities: mlData.probabilities,
          maxConfidence: Math.max(...Object.values(mlData.probabilities)),
        });
        fallbackUsed = true;
        console.log("✅ Gemini insight:", {
          riskLevel: geminiInsight.riskLevel,
          insight: geminiInsight.emotionalInsight.substring(0, 100),
        });
      } catch (geminiErr) {
        console.error("⚠️ Gemini fallback failed (non-fatal):", geminiErr);
        // Continue without Gemini — ML result still available
      }
    }

    // ─── STEP 3: Fusion Engine — Merge ML + Gemini ──────────────────────────

    const labelMap: Record<string, string> = {
      anxiety: "Anxiety",
      stress: "Stress",
      depression: "Depression",
      suicidal: "Depression",
      bipolar: "Bipolar",
      normal: "Neutral",
    };

    let displayPrediction = "Neutral";
    let confidence = 0;

    if (mlData.labels && mlData.labels.length > 0) {
      const nonNormalLabels = mlData.labels.filter((l) => l !== "Normal");
      if (nonNormalLabels.length > 0) {
        displayPrediction =
          labelMap[nonNormalLabels[0].toLowerCase()] || nonNormalLabels[0];
        const labelKey = nonNormalLabels[0];
        confidence = mlData.probabilities[labelKey] || 0;
      } else if (mlData.labels[0] === "Normal") {
        displayPrediction = "Neutral";
        confidence = Math.max(...Object.values(mlData.probabilities));
      }
    }

    // Build explanation array
    let explanation: string[] = [];

    if (mlData.explanation) {
      explanation = [mlData.explanation];
    } else if (mlData.labels && mlData.labels.length > 0) {
      if (mlData.labels[0] === "Normal") {
        explanation = [
          "No significant mental health indicators detected in this text.",
        ];
      } else {
        const significantLabels = mlData.labels.filter((l) => l !== "Normal");
        if (significantLabels.length > 0) {
          explanation = [
            `Detected: ${significantLabels
              .map((l) => {
                const prob = mlData.probabilities[l];
                return `${l} (${(prob * 100).toFixed(1)}%)`;
              })
              .join(", ")}`,
          ];
        } else {
          explanation = ["No significant mental health indicators detected"];
        }
      }
    }

    // Add Gemini insight to explanation if available
    if (geminiInsight) {
      explanation.push(`AI Insight: ${geminiInsight.emotionalInsight}`);
    }

    // Determine final risk level
    const finalRiskLevel = determineFinalRiskLevel(mlData, geminiInsight);

    // Check for crisis escalation
    const crisisEscalation = finalRiskLevel === "High";

    if (crisisEscalation) {
      console.log("🚨 CRISIS ESCALATION triggered — high risk detected");
      explanation.push(CRISIS_ESCALATION_MESSAGE);
    }

    // Prepare all predictions for display
    const allPredictions = Object.entries(mlData.probabilities)
      .map(([label, prob]) => ({
        label: label.toLowerCase(),
        confidence: prob,
      }))
      .sort((a, b) => b.confidence - a.confidence);

    // ─── STEP 4: Save to Database ───────────────────────────────────────────

    const result: SavedAnalysis = {
      userId,
      text: mlData.translation_info?.analyzed_text || text,
      language: mlData.language_info?.language || language || "en",
      prediction: displayPrediction,
      confidence,
      explanation,
      mlData: {
        labels: mlData.labels,
        probabilities: mlData.probabilities,
        allPredictions,
        rawProbs: mlData.raw_probs,
        shapData: mlData.shapData,
      },
      geminiInsight: geminiInsight
        ? {
            emotionalInsight: geminiInsight.emotionalInsight,
            suggestedSupport: geminiInsight.suggestedSupport,
            riskLevel: geminiInsight.riskLevel,
          }
        : undefined,
      fallbackUsed,
      riskLevel: finalRiskLevel,
      crisisEscalation,
      detectedLanguage: mlData.language_info?.language,
      wasTranslated: mlData.translation_info?.was_translated || false,
      originalText: mlData.translation_info?.was_translated
        ? mlData.translation_info.original_text
        : undefined,
    };

    console.log("💾 Saving to DB:", {
      prediction: result.prediction,
      confidence: result.confidence,
      labels: mlData.labels,
      fallbackUsed,
      riskLevel: finalRiskLevel,
      crisisEscalation,
    });

    const saved = await Analysis.create(result);

    // Create/update EmotionSnapshot for analytics
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const probs = mlData.probabilities;
      const overall =
        (probs.Anxiety || 0) * 0.25 +
        (probs.Stress || 0) * 0.25 +
        (probs.Depression || 0) * 0.3 +
        (probs.Bipolar || 0) * 0.2;

      await EmotionSnapshot.findOneAndUpdate(
        { userId, date: today },
        {
          $set: {
            sentimentScores: {
              anxiety: probs.Anxiety || 0,
              stress: probs.Stress || 0,
              depression: probs.Depression || 0,
              bipolar: probs.Bipolar || 0,
              overall: Math.round(overall * 1000) / 1000,
            },
            source: "analysis",
          },
          $inc: { entryCount: 1 },
        },
        { upsert: true, new: true }
      );
    } catch (snapshotErr) {
      console.error("⚠️ EmotionSnapshot error (non-fatal):", snapshotErr);
    }

    // ─── STEP 5: Notify assigned doctors on crisis ──────────────────────────
    if (crisisEscalation) {
      try {
        const assignments = await PatientDoctor.find({
          patientId: userId,
          status: "active",
        }).lean();

        if (assignments.length > 0) {
          const notifications = assignments.map((a) => ({
            userId: a.doctorId,
            type: "crisis_alert" as const,
            title: "🚨 Crisis Alert — High Risk Detected",
            body: `A patient has submitted a journal entry with high-risk indicators. Prediction: ${displayPrediction}, Risk: ${finalRiskLevel}.`,
            priority: "critical" as const,
            metadata: {
              patientId: userId,
              analysisId: saved._id,
              riskLevel: finalRiskLevel,
              prediction: displayPrediction,
            },
          }));
          await Notification.insertMany(notifications);
          console.log(`🔔 Crisis notifications sent to ${assignments.length} doctor(s)`);
        }
      } catch (notifErr) {
        console.error("⚠️ Crisis notification error (non-fatal):", notifErr);
      }
    }

    return NextResponse.json(saved);
  } catch (error) {
    console.error("❌ Error in analysis route:", error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: `Analysis failed: ${errMsg}`,
        prediction: "Error",
        confidence: 0,
        explanation: [`Analysis error: ${errMsg}`],
        mlData: null,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const history = await Analysis.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json(history);
  } catch (error) {
    console.error("❌ Error fetching history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}