import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getUserFromRequest } from "@/lib/auth";

/**
 * POST /api/auth/validate-token
 * Validates a JWT token and returns user data if valid
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Get user from JWT token in Authorization header
    const user = getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or missing token" },
        { status: 401 }
      );
    }

    // Fetch user from database to get latest info
    const dbUser = await User.findById(user.id).select("-password");

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Return user data with token (token stays the same)
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    return NextResponse.json(
      {
        user: {
          id: dbUser._id.toString(),
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
        },
        token: token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Token validation error:", error);
    return NextResponse.json(
      { error: "Token validation failed" },
      { status: 500 }
    );
  }
}
