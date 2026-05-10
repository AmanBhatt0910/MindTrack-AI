import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { Mood } from "@/models/Mood";

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

export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const moods = await Mood.find({ userId }).sort({ date: -1 });

    // Format to match MoodEntry type
    const formatted = moods.map((m) => ({
      id: m._id.toString(),
      date: m.date.toISOString(),
      mood: m.mood,
      score: m.score,
      note: m.note,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching mood history:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { mood, score, note } = await req.json();

    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const newMood = await Mood.create({
      userId,
      mood,
      score,
      note,
      date: new Date(),
    });

    return NextResponse.json({
      id: newMood._id.toString(),
      date: newMood.date.toISOString(),
      mood: newMood.mood,
      score: newMood.score,
      note: newMood.note,
    });
  } catch (error) {
    console.error("Error saving mood:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
