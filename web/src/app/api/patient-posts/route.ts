import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { PatientPost } from "@/models/PatientPost";
import { PatientDoctor } from "@/models/PatientDoctor";
import { verifyToken } from "@/lib/auth";

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
    const url = new URL(req.url);
    const patientId = url.searchParams.get("patientId");

    // If patientId is provided, the requester must be a doctor
    if (patientId) {
      if (patientId === userId) {
        // Patient fetching their own posts explicitly
        const posts = await PatientPost.find({ userId }).sort({ createdAt: -1 });
        return NextResponse.json(posts);
      }

      // Verify doctor assignment
      const assignment = await PatientDoctor.findOne({
        doctorId: userId,
        patientId,
        status: "active",
      });

      if (!assignment) {
        return NextResponse.json({ error: "Not authorized to view this patient's posts" }, { status: 403 });
      }

      // Fetch only posts where allowDoctorAnalysis is true
      const posts = await PatientPost.find({ 
        userId: patientId, 
        allowDoctorAnalysis: true 
      }).sort({ createdAt: -1 });

      return NextResponse.json(posts);
    }

    // Patient fetching their own posts
    const posts = await PatientPost.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching patient posts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { content, allowDoctorAnalysis } = await req.json();

    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    await connectDB();

    const newPost = await PatientPost.create({
      userId,
      content,
      allowDoctorAnalysis: !!allowDoctorAnalysis,
    });

    return NextResponse.json(newPost);
  } catch (error) {
    console.error("Error creating patient post:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
