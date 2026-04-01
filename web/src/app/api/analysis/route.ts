import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Analysis } from "@/models/Analysis";
import { EmotionSnapshot } from "@/models/EmotionSnapshot";
import { verifyToken } from "@/lib/auth";

// Define types for ML API response matching the new format
interface MLPrediction {
  label: string;
  confidence: number;
}

interface MLDataResponse {
  labels: string[];  // This is the key change - array of predicted labels
  probabilities: Record<string, number>;
  label?: string;  // For backward compatibility
  confidence?: number;
  all_predictions?: MLPrediction[];
  explanation?: string;
  raw_probs?: number[];
  error?: string;
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
  };
}

// Helper to get userId from Authorization header
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
      return NextResponse.json({
        error: "ML API URL not configured",
        prediction: "Error",
        confidence: 0,
        explanation: ["ML service is not configured. Set ML_API_URL in .env.local"],
        mlData: null,
      }, { status: 503 });
    }

    console.log("📤 Sending to ML API:", { 
      text: text.substring(0, 100),
      url: mlApiUrl 
    });

    // 15-second timeout for model inference
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let mlResponse: Response;
    try {
      mlResponse = await fetch(`${mlApiUrl}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });
    } catch (fetchErr: unknown) {
      clearTimeout(timeoutId);
      const errMsg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      console.error("❌ Cannot reach ML API:", errMsg);
      return NextResponse.json({
        error: `Cannot connect to ML service at ${mlApiUrl}. Is the model server running?`,
        prediction: "Error",
        confidence: 0,
        explanation: [`ML service unreachable: ${errMsg}. Make sure uvicorn is running from the model/ directory.`],
        mlData: null,
      }, { status: 503 });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!mlResponse.ok) {
      const errorText = await mlResponse.text();
      console.error("ML API error:", errorText);
      return NextResponse.json({
        error: `ML API returned ${mlResponse.status}`,
        prediction: "Error",
        confidence: 0,
        explanation: [`ML service error: ${errorText}`],
        mlData: null,
      }, { status: 502 });
    }

    const mlData: MLDataResponse = await mlResponse.json();
    console.log("📥 ML API Response:", mlData);

    // Check if there was an error from ML API
    if (mlData.error) {
      console.error("ML API returned error:", mlData.error);
      return NextResponse.json({
        prediction: "Neutral",
        confidence: 0,
        explanation: ["Unable to analyze at this moment. Please try again."],
        mlData: null
      });
    }

    // Map the prediction to display format
    const labelMap: Record<string, string> = {
      anxiety: "Anxiety",
      stress: "Stress", 
      depression: "Depression",
      suicidal: "Depression",
      bipolar: "Bipolar",
      normal: "Neutral"
    };

    // Get the primary prediction from the labels array
    let displayPrediction = "Neutral";
    let confidence = 0;
    
    if (mlData.labels && mlData.labels.length > 0) {
      // Use the first non-Normal label if available
      const nonNormalLabels = mlData.labels.filter(l => l !== "Normal");
      if (nonNormalLabels.length > 0) {
        displayPrediction = labelMap[nonNormalLabels[0].toLowerCase()] || nonNormalLabels[0];
        // Get confidence for this label
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
        explanation = ["No significant mental health indicators detected in this text."];
      } else {
        const significantLabels = mlData.labels.filter(l => l !== "Normal");
        if (significantLabels.length > 0) {
          explanation = [
            `Detected: ${significantLabels.map(l => {
              const prob = mlData.probabilities[l];
              return `${l} (${(prob * 100).toFixed(1)}%)`;
            }).join(", ")}`
          ];
        } else {
          explanation = ["No significant mental health indicators detected"];
        }
      }
    }

    // Prepare all predictions for display
    const allPredictions = Object.entries(mlData.probabilities).map(([label, prob]) => ({
      label: label.toLowerCase(),
      confidence: prob
    })).sort((a, b) => b.confidence - a.confidence);

    // Prepare the result for database storage
    const result: SavedAnalysis = {
      userId,
      text,
      language,
      prediction: displayPrediction,
      confidence: confidence,
      explanation: explanation,
      mlData: {
        labels: mlData.labels,
        probabilities: mlData.probabilities,
        allPredictions: allPredictions,
        rawProbs: mlData.raw_probs
      }
    };

    console.log("💾 Saving to DB:", {
      prediction: result.prediction,
      confidence: result.confidence,
      labels: mlData.labels,
      explanationLength: result.explanation.length
    });

    // Save to database
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

    return NextResponse.json(saved);
    
  } catch (error) {
    console.error("❌ Error in analysis route:", error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({
      error: `Analysis failed: ${errMsg}`,
      prediction: "Error",
      confidence: 0,
      explanation: [`Analysis error: ${errMsg}`],
      mlData: null,
    }, { status: 500 });
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