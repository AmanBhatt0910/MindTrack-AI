import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Analysis } from "@/models/Analysis";
import { verifyToken } from "@/lib/auth";

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

    // const mlResponse = await fetch(`${process.env.ML_API_URL}/predict`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ text }),
    // });

    // if (!mlResponse.ok) {
    //   throw new Error("ML API failed");
    // }

    const mlResponse = await fetch(
      `https://api-inference.huggingface.co/models/${process.env.HF_MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: text,
        }),
      }
    );

    const mlData = await mlResponse.json();

    const labelMap: Record<string, string> = {
      anxiety: "Anxiety",
      stress: "Stress",
      depression: "Depression",
      normal: "Neutral",
      suicidal: "Depression",
      bipolar: "Bipolar",
      "personality disorder": "Bipolar",
    };

    const result = {
      prediction: labelMap[mlData.label] || "Neutral",
      confidence: mlData.confidence || 0,
      explanation: [
        `Detected ${mlData.label} with ${(mlData.confidence * 100).toFixed(2)}% confidence`,
      ],
    };

    const saved = await Analysis.create({
      userId,
      text,
      language,
      ...result,
    });

    return NextResponse.json(saved);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}