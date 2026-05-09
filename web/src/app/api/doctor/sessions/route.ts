/**
 * Doctor Sessions API
 * GET  /api/doctor/sessions — List session notes (optionally filtered by patient)
 * POST /api/doctor/sessions — Create a new session note
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireDoctor, isAuthed } from "@/lib/rbac";
import { SessionNote } from "@/models/SessionNote";
import { PatientDoctor } from "@/models/PatientDoctor";
import { AuditLog } from "@/models/AuditLog";

export async function GET(req: Request) {
  const auth = requireDoctor(req);
  if (!isAuthed(auth)) return auth;

  await connectDB();
  const doctorId = auth.user.id;
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patientId");

  const filter: Record<string, unknown> = { doctorId };
  if (patientId) filter.patientId = patientId;

  const sessions = await SessionNote.find(filter)
    .sort({ sessionDate: -1 })
    .limit(50)
    .lean();

  return NextResponse.json({ sessions });
}

export async function POST(req: Request) {
  const auth = requireDoctor(req);
  if (!isAuthed(auth)) return auth;

  await connectDB();
  const doctorId = auth.user.id;
  const body = await req.json();

  const { patientId, sessionDate, noteContent, moodAtSession, riskAssessment, primaryConcerns, followUpRequired, nextSessionDate } = body;

  if (!patientId || !noteContent) {
    return NextResponse.json(
      { error: "patientId and noteContent are required" },
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
    return NextResponse.json(
      { error: "Not authorized for this patient" },
      { status: 403 }
    );
  }

  const session = await SessionNote.create({
    doctorId,
    patientId,
    sessionDate: sessionDate ? new Date(sessionDate) : new Date(),
    noteContent,
    moodAtSession: moodAtSession || "neutral",
    riskAssessment: riskAssessment || "Low",
    primaryConcerns: primaryConcerns || [],
    followUpRequired: followUpRequired || false,
    nextSessionDate: nextSessionDate ? new Date(nextSessionDate) : null,
  });

  await AuditLog.create({
    userId: doctorId,
    action: "create_session_note",
    resource: "SessionNote",
    resourceId: session._id.toString(),
  });

  return NextResponse.json({ session }, { status: 201 });
}
