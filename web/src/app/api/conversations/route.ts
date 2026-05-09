import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { Conversation } from "@/models/Conversation";
import { User } from "@/models/User";
import { PatientDoctor } from "@/models/PatientDoctor";

export async function GET(req: Request) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const userId = auth.id;
  const isDoctor = auth.role === "doctor" || auth.role === "admin";

  // 1. Fetch active relationships
  const query = isDoctor ? { doctorId: userId, status: "active" } : { patientId: userId, status: "active" };
  const assignments = await PatientDoctor.find(query).lean();

  if (!assignments.length) {
    return NextResponse.json({ conversations: [] });
  }

  // 2. Sync relationships to conversations
  for (const assignment of assignments) {
    const existing = await Conversation.findOne({
      doctorId: assignment.doctorId,
      patientId: assignment.patientId
    });

    if (!existing) {
      await Conversation.create({
        participants: [assignment.doctorId, assignment.patientId],
        doctorId: assignment.doctorId,
        patientId: assignment.patientId,
        unreadCounts: {
          [assignment.doctorId]: 0,
          [assignment.patientId]: 0,
        }
      });
    }
  }

  // 3. Fetch all conversations for the user
  const conversations = await Conversation.find({
    participants: userId
  }).sort({ "lastMessage.createdAt": -1 }).lean();

  if (!conversations.length) {
    return NextResponse.json({ conversations: [] });
  }

  // 4. Enrich with the other participant's details
  const otherUserIds = conversations.map(c => 
    c.participants.find((p: any) => p.toString() !== userId)
  ).filter(Boolean);

  const users = await User.find(
    { _id: { $in: otherUserIds } },
    { name: 1, email: 1, role: 1 }
  ).lean();

  const userMap = new Map(users.map(u => [u._id.toString(), u]));

  const enriched = conversations.map(c => {
    const otherId = c.participants.find((p: any) => p.toString() !== userId)?.toString();
    const otherUser = otherId ? userMap.get(otherId) : null;
    
    return {
      id: c._id,
      patientId: c.patientId,
      doctorId: c.doctorId,
      otherUser: otherUser ? {
        id: otherUser._id,
        name: otherUser.name,
        email: otherUser.email,
        role: otherUser.role
      } : null,
      lastMessage: c.lastMessage || null,
      unreadCount: c.unreadCounts?.[userId] || 0,
      metadata: c.metadata,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    };
  });

  return NextResponse.json({ conversations: enriched });
}
