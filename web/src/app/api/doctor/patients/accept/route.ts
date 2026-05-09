import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireDoctor, isAuthed } from "@/lib/rbac";
import { PatientDoctor } from "@/models/PatientDoctor";
import { Conversation } from "@/models/Conversation";

export async function POST(req: Request) {
  const auth = requireDoctor(req);
  if (!isAuthed(auth)) return auth;

  await connectDB();
  const doctorId = auth.user.id;
  const { patientId } = await req.json();

  if (!patientId) {
    return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
  }

  const assignment = await PatientDoctor.findOne({ doctorId, patientId });

  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  if (assignment.status !== "pending") {
    return NextResponse.json({ error: "Assignment is not pending" }, { status: 400 });
  }

  assignment.status = "active";
  assignment.consentGiven = true;
  await assignment.save();

  // Create conversation if it doesn't exist
  let conversation = await Conversation.findOne({ doctorId, patientId });
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [doctorId, patientId],
      doctorId,
      patientId,
      unreadCounts: {
        [doctorId]: 0,
        [patientId]: 0,
      }
    });
  }

  return NextResponse.json({ success: true, assignment, conversation });
}
