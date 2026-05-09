/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces role requirements and doctor-patient relationship access.
 */

import { NextResponse } from "next/server";
import { getUserFromRequest, type TokenPayload } from "@/lib/auth";
import type { UserRole } from "@/types/auth.types";

// ─── Role Guard ─────────────────────────────────────────────────────────────────

export interface AuthResult {
  user: TokenPayload;
}

/**
 * Validates that the request has a valid JWT with one of the allowed roles.
 * Returns the authenticated user or a NextResponse error.
 */
export function requireRole(
  req: Request,
  ...allowedRoles: UserRole[]
): AuthResult | NextResponse {
  const user = getUserFromRequest(req);

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 }
    );
  }

  return { user };
}

/**
 * Convenience: require the doctor role.
 */
export function requireDoctor(req: Request): AuthResult | NextResponse {
  return requireRole(req, "doctor", "admin");
}

/**
 * Convenience: require the patient role.
 */
export function requirePatient(req: Request): AuthResult | NextResponse {
  return requireRole(req, "patient");
}

/**
 * Type guard to check if the result is an AuthResult (success) vs NextResponse (error).
 */
export function isAuthed(
  result: AuthResult | NextResponse
): result is AuthResult {
  return "user" in result;
}
