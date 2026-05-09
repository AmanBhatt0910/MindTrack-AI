import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { Conversation } from "@/models/Conversation";
import { Message } from "@/models/Message";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const userId = auth.id;
  const { id: conversationId } = await params;

  // Validate access to conversation
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const isParticipant = conversation.participants.some((p: any) => p.toString() === userId);
  if (!isParticipant) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  // Fetch messages
  const messages = await Message.find({ conversationId })
    .sort({ createdAt: 1 })
    .limit(200)
    .lean();

  return NextResponse.json({ messages });
}
