import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Analysis } from "@/models/Analysis";

export async function POST(req: Request) {
  const { text, language } = await req.json();

  await connectDB();

  // Dummy AI (replace later)
  const result = text.includes("sad")
    ? {
        prediction: "Depression",
        confidence: 0.87,
        explanation: ["Negative sentiment detected"],
      }
    : {
        prediction: "Neutral",
        confidence: 0.65,
        explanation: ["Balanced tone"],
      };

  const saved = await Analysis.create({
    userId: "demo-user",
    text,
    ...result,
  });

  return NextResponse.json(saved);
}

export async function GET() {
  await connectDB();

  const history = await Analysis.find().sort({ createdAt: -1 });

  return NextResponse.json(history);
}