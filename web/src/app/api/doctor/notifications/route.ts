/**
 * Doctor Notifications API
 * GET   /api/doctor/notifications — List notifications
 * PATCH /api/doctor/notifications — Mark notifications as read
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
  const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 100);

  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ userId: doctorId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
    Notification.countDocuments({ userId: doctorId, read: false }),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(req: Request) {
  const auth = requireDoctor(req);
  if (!isAuthed(auth)) return auth;

  await connectDB();
  const doctorId = auth.user.id;
  const { ids } = await req.json();

  if (ids && Array.isArray(ids)) {
    await Notification.updateMany(
      { _id: { $in: ids }, userId: doctorId },
      { read: true }
    );
  } else {
    // Mark all as read
    await Notification.updateMany(
      { userId: doctorId, read: false },
      { read: true }
    );
  }

  return NextResponse.json({ success: true });
}
