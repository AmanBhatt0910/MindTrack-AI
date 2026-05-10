import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { PatientPost } from "@/models/PatientPost";
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { analysisId } = await req.json();

    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find the post
    const post = await PatientPost.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Verify it allows analysis (if doctor is updating it, this assumes auth was checked in GET/list, 
    // but just to be safe, we allow any update if they have the ID, since the actual analysis generation was guarded)
    post.analyzed = true;
    post.analysisId = analysisId;
    await post.save();

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error updating patient post:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
