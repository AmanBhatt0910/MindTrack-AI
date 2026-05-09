/**
 * Doctor Alerts API
 * GET /api/doctor/alerts — Crisis alerts for doctor's patients
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireDoctor, isAuthed } from "@/lib/rbac";
import { Notification } from "@/models/Notification";

export async function GET(req: Request) {
  const auth = requireDoctor(req);
  if (!isAuthed(auth)) return auth;

  await connectDB();
  const doctorId = auth.user.id;
  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get("unread") === "true";

  const filter: Record<string, unknown> = {
    userId: doctorId,
    type: { $in: ["crisis_alert", "risk_change"] },
  };

  if (unreadOnly) filter.read = false;

  const alerts = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return NextResponse.json({ alerts });
}
