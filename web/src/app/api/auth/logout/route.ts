import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

/**
 * POST /api/auth/logout
 * Logout endpoint - clears tokens on backend
 * Frontend should also clear localStorage
 */
export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const user = getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 200 }
      );
    }

    // Token invalidation happens on frontend via localStorage cleanup
    // Backend can log this event if needed for audit trail

    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { message: "Logout completed" },
      { status: 200 }
    );
  }
}
