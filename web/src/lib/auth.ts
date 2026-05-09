import jwt from "jsonwebtoken";
import type { UserRole } from "@/types/auth.types";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface TokenPayload {
  id: string;
  role: UserRole;
}

export const signToken = (payload: { id: string; role: UserRole }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};

export const getUserFromRequest = (req: Request): TokenPayload | null => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  if (!token) return null;
  try {
    const decoded = verifyToken(token);
    if (typeof decoded === "string") return null;
    return {
      id: decoded.id as string,
      role: (decoded.role as UserRole) || "patient", // fallback for legacy tokens
    };
  } catch {
    return null;
  }
};

// Keep backward-compatible export
export const getUserIdFromRequest = (req: Request): string | null => {
  const user = getUserFromRequest(req);
  return user?.id ?? null;
};