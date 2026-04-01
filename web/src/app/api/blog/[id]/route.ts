import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { BlogPost } from "@/models/BlogPost";
import { User } from "@/models/User";
import { getUserIdFromRequest } from "@/lib/auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET single post
export async function GET(req: Request, context: RouteContext) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    await connectDB();
    const post = await BlogPost.findById(id).lean();

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Blog get error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT — update post (owner only)
export async function PUT(req: Request, context: RouteContext) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const updates = await req.json();

    await connectDB();

    const post = await BlogPost.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    if (post.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    Object.assign(post, {
      title: updates.title ?? post.title,
      content: updates.content ?? post.content,
      emotionTags: updates.emotionTags ?? post.emotionTags,
      isAnonymous: updates.isAnonymous ?? post.isAnonymous,
    });

    await post.save();
    return NextResponse.json(post);
  } catch (error) {
    console.error("Blog update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE — delete post (owner only)
export async function DELETE(req: Request, context: RouteContext) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    await connectDB();

    const post = await BlogPost.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    if (post.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await BlogPost.findByIdAndDelete(id);
    return NextResponse.json({ message: "Post deleted" });
  } catch (error) {
    console.error("Blog delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — like/comment
export async function POST(req: Request, context: RouteContext) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const url = new URL(req.url);
    const body = await req.json();

    await connectDB();

    const post = await BlogPost.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Like toggle
    if (url.pathname.endsWith("/like") || body.action === "like") {
      const likedIndex = post.likedBy.indexOf(userId);
      if (likedIndex >= 0) {
        post.likedBy.splice(likedIndex, 1);
        post.likes = Math.max(0, post.likes - 1);
      } else {
        post.likedBy.push(userId);
        post.likes += 1;
      }
      await post.save();
      return NextResponse.json({
        likes: post.likes,
        liked: post.likedBy.includes(userId),
      });
    }

    // Comment
    if (url.pathname.endsWith("/comment") || body.action === "comment") {
      const user = await User.findById(userId).lean();
      const authorName = (user as Record<string, unknown>)?.name as string || "User";

      if (!body.content || body.content.length > 1000) {
        return NextResponse.json(
          { error: "Comment content required (max 1000 chars)" },
          { status: 400 }
        );
      }

      post.comments.push({
        userId,
        authorName,
        content: body.content,
      });

      await post.save();
      return NextResponse.json(post);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Blog action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
