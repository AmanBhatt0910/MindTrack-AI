/**
 * Alert Acknowledge API
 * PATCH /api/doctor/alerts/[id]/acknowledge — Mark an alert as read/handled
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireDoctor, isAuthed } from "@/lib/rbac";
import { Notification } from "@/models/Notification";
import { AuditLog } from "@/models/AuditLog";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireDoctor(req);
  if (!isAuthed(auth)) return auth;

  await connectDB();
  const { id: alertId } = await params;

  const alert = await Notification.findOneAndUpdate(
    { _id: alertId, userId: auth.user.id },
    { read: true },
    { new: true }
  );

  if (!alert) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  }

  await AuditLog.create({
    userId: auth.user.id,
    action: "acknowledge_alert",
    resource: "Notification",
    resourceId: alertId,
  });

  return NextResponse.json({ alert });
}
