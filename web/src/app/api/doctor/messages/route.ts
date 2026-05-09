/**
 * Doctor Messages API
 * GET  /api/doctor/messages — Get message threads or messages with a patient
 * POST /api/doctor/messages — Send a message to a patient
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireDoctor, isAuthed } from "@/lib/rbac";
import { Message } from "@/models/Message";
import { PatientDoctor } from "@/models/PatientDoctor";
import { Notification } from "@/models/Notification";
import { User } from "@/models/User";
import { AuditLog } from "@/models/AuditLog";

export async function GET(req: Request) {
  const auth = requireDoctor(req);
  if (!isAuthed(auth)) return auth;

  await connectDB();
  const doctorId = auth.user.id;
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patientId");

  if (patientId) {
    // Verify relationship
    const assignment = await PatientDoctor.findOne({
      doctorId,
      patientId,
      status: "active",
    });
    if (!assignment) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Get messages between doctor and patient
    const messages = await Message.find({
      $or: [
        { senderId: doctorId, receiverId: patientId },
        { senderId: patientId, receiverId: doctorId },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(100)
      .lean();

    // Mark unread messages as read
    await Message.updateMany(
      { senderId: patientId, receiverId: doctorId, read: false },
      { read: true, readAt: new Date() }
    );

    return NextResponse.json({ messages });
  }

  // Get recent threads (latest message per patient)
  const assignments = await PatientDoctor.find({
    doctorId,
    status: "active",
  }).lean();
  const patientIds = assignments.map((a) => a.patientId);

  const threads = await Message.aggregate([
    {
      $match: {
        $or: [
          { senderId: doctorId, receiverId: { $in: patientIds } },
          { senderId: { $in: patientIds }, receiverId: doctorId },
        ],
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: {
          $cond: [{ $eq: ["$senderId", doctorId] }, "$receiverId", "$senderId"],
        },
        lastMessage: { $first: "$$ROOT" },
        unreadCount: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ["$receiverId", doctorId] }, { $eq: ["$read", false] }] },
              1,
              0,
            ],
          },
        },
      },
    },
    { $sort: { "lastMessage.createdAt": -1 } },
  ]);

  // Enrich with patient names
  const threadPatientIds = threads.map((t) => t._id);
  const patients = await User.find(
    { _id: { $in: threadPatientIds } },
    { name: 1, email: 1 }
  ).lean();
  const patientMap = new Map(patients.map((p) => [p._id.toString(), p]));

  const enrichedThreads = threads.map((t) => ({
    patientId: t._id,
    patientName: patientMap.get(t._id.toString())?.name || "Unknown",
    patientEmail: patientMap.get(t._id.toString())?.email || "",
    lastMessage: {
      content: t.lastMessage.content.substring(0, 100),
      sentAt: t.lastMessage.createdAt,
      fromDoctor: t.lastMessage.senderId.toString() === doctorId,
    },
    unreadCount: t.unreadCount,
  }));

  return NextResponse.json({ threads: enrichedThreads });
}

export async function POST(req: Request) {
  const auth = requireDoctor(req);
  if (!isAuthed(auth)) return auth;

  await connectDB();
  const doctorId = auth.user.id;
  const { patientId, content } = await req.json();

  if (!patientId || !content) {
    return NextResponse.json(
      { error: "patientId and content are required" },
      { status: 400 }
    );
  }

  // Verify relationship
  const assignment = await PatientDoctor.findOne({
    doctorId,
    patientId,
    status: "active",
  });
  if (!assignment) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const message = await Message.create({
    senderId: doctorId,
    receiverId: patientId,
    senderRole: "doctor",
    content,
  });

  // Notify patient
  await Notification.create({
    userId: patientId,
    type: "message",
    title: "New message from your therapist",
    body: content.substring(0, 100),
    priority: "medium",
    metadata: { messageId: message._id },
  });

  await AuditLog.create({
    userId: doctorId,
    action: "send_message",
    resource: "Message",
    resourceId: message._id.toString(),
  });

  return NextResponse.json({ message }, { status: 201 });
}
