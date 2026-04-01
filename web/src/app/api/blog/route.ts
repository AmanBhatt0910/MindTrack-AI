import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { BlogPost } from "@/models/BlogPost";
import { User } from "@/models/User";
import { getUserIdFromRequest } from "@/lib/auth";

// Basic content moderation — flag posts with harmful content
const FLAGGED_WORDS = [
  "kill", "murder", "hate", "slur", "abuse", "explicit",
  // Add more as needed
];

function shouldFlag(text: string): boolean {
  const lower = text.toLowerCase();
  // Only flag if multiple harmful words present (reduces false positives)
  const matches = FLAGGED_WORDS.filter((w) => lower.includes(w));
  return matches.length >= 2;
}

// GET — List published posts (community feed)
export async function GET(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 12;
    const tag = searchParams.get("tag");
    const myPosts = searchParams.get("my") === "true";

    await connectDB();

    const query: Record<string, unknown> = { status: "published" };
    if (tag) {
      // Search in emotionTags (case-insensitive), title, and content
      const tagRegex = new RegExp(tag, "i");
      query.$or = [
        { emotionTags: { $regex: tagRegex } },
        { title: { $regex: tagRegex } },
        { content: { $regex: tagRegex } },
      ];
    }
    if (myPosts) query.userId = userId;

    const [posts, total] = await Promise.all([
      BlogPost.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      BlogPost.countDocuments(query),
    ]);

    return NextResponse.json({
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Blog list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST — Create a blog post
export async function POST(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, emotionTags, isAnonymous } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        { error: "Title too long (max 200 characters)" },
        { status: 400 }
      );
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { error: "Content too long (max 5000 characters)" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get user name
    const user = await User.findById(userId).lean();
    const authorName = isAnonymous
      ? "Anonymous"
      : (user as Record<string, unknown>)?.name as string || "User";

    // Content moderation
    const status = shouldFlag(title + " " + content) ? "flagged" : "published";

    const post = await BlogPost.create({
      userId,
      authorName,
      title,
      content,
      emotionTags: emotionTags || [],
      isAnonymous: isAnonymous || false,
      status,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Blog create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
