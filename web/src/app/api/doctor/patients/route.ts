/**
 * Doctor Patients API
 * GET  /api/doctor/patients       — List assigned patients with latest risk
 * POST /api/doctor/patients       — Assign a patient by email
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireDoctor, isAuthed } from "@/lib/rbac";
import { PatientDoctor } from "@/models/PatientDoctor";
import { User } from "@/models/User";
import { Analysis } from "@/models/Analysis";
import { AuditLog } from "@/models/AuditLog";
import { Notification } from "@/models/Notification";

export async function GET(req: Request) {
  const auth = requireDoctor(req);
  if (!isAuthed(auth)) return auth;

  await connectDB();
  const doctorId = auth.user.id;

  // Get all active assignments
  const assignments = await PatientDoctor.find({
    doctorId,
    status: { $in: ["active", "pending"] },
  }).lean();

  if (assignments.length === 0) {
    return NextResponse.json({ patients: [] });
  }

  const patientIds = assignments.map((a) => a.patientId);

  // Fetch patient details
  const patients = await User.find(
    { _id: { $in: patientIds } },
    { name: 1, email: 1, createdAt: 1 }
  ).lean();

  // Fetch latest analysis per patient
  const latestAnalyses = await Analysis.aggregate([
    { $match: { userId: { $in: patientIds.map(String) } } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$userId",
        latest: { $first: "$$ROOT" },
        totalEntries: { $sum: 1 },
      },
    },
  ]);

  const analysisMap = new Map(
    latestAnalyses.map((a) => [a._id, a])
  );
  const assignmentMap = new Map(
    assignments.map((a) => [a.patientId.toString(), a])
  );

  const enrichedPatients = patients.map((p) => {
    const pid = p._id.toString();
    const analysis = analysisMap.get(pid);
    const assignment = assignmentMap.get(pid);
    return {
      id: pid,
      name: p.name,
      email: p.email,
      joinedAt: p.createdAt,
      assignmentStatus: assignment?.status || "unknown",
      consentGiven: assignment?.consentGiven || false,
      latestRiskLevel: analysis?.latest?.riskLevel || "Unknown",
      latestPrediction: analysis?.latest?.prediction || "N/A",
      latestConfidence: analysis?.latest?.confidence || 0,
      lastAnalysisDate: analysis?.latest?.createdAt || null,
      totalEntries: analysis?.totalEntries || 0,
      // Priority score: higher = more urgent
      priorityScore: calculatePriority(analysis?.latest),
    };
  });

  // Sort by priority (high-risk first)
  enrichedPatients.sort((a, b) => b.priorityScore - a.priorityScore);

  return NextResponse.json({ patients: enrichedPatients });
}

function calculatePriority(analysis?: Record<string, unknown>): number {
  if (!analysis) return 0;
  let score = 0;
  if (analysis.riskLevel === "High") score += 100;
  else if (analysis.riskLevel === "Medium") score += 50;
  if (analysis.crisisEscalation) score += 200;
  score += (analysis.confidence as number || 0) * 10;
  return score;
}

export async function POST(req: Request) {
  const auth = requireDoctor(req);
  if (!isAuthed(auth)) return auth;

  await connectDB();
  const doctorId = auth.user.id;
  const { patientEmail } = await req.json();

  if (!patientEmail) {
    return NextResponse.json(
      { error: "Patient email is required" },
      { status: 400 }
    );
  }

  // Find patient
  const patient = await User.findOne({
    email: patientEmail,
    role: { $in: ["patient", null] }, // include legacy users without role
  });

  if (!patient) {
    return NextResponse.json(
      { error: "Patient not found" },
      { status: 404 }
    );
  }

  // Check for existing assignment
  const existing = await PatientDoctor.findOne({
    patientId: patient._id,
    doctorId,
  });

  if (existing) {
    if (existing.status === "revoked") {
      existing.status = "pending";
      existing.consentGiven = false;
      await existing.save();
      return NextResponse.json({
        message: "Re-assignment requested",
        assignment: existing,
      });
    }
    return NextResponse.json(
      { error: "Patient already assigned" },
      { status: 409 }
    );
  }

  // Create assignment (auto-active for MVP, consent auto-granted)
  const assignment = await PatientDoctor.create({
    patientId: patient._id,
    doctorId,
    status: "active",
    consentGiven: true,
    consentDate: new Date(),
  });

  // Audit log
  await AuditLog.create({
    userId: doctorId,
    action: "assign_patient",
    resource: "PatientDoctor",
    resourceId: assignment._id.toString(),
    details: `Assigned patient ${patient.email}`,
  });

  // Notify patient
  await Notification.create({
    userId: patient._id,
    type: "new_patient",
    title: "Therapist Connected",
    body: "A therapist has been connected to your account to help monitor your mental health journey.",
    priority: "medium",
  });

  return NextResponse.json({
    message: "Patient assigned successfully",
    assignment,
  });
}
