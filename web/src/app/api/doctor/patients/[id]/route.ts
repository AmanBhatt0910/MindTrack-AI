/**
 * Patient Detail API
 * GET /api/doctor/patients/[id] — Full patient detail + analysis history
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireDoctor, isAuthed } from "@/lib/rbac";
import { PatientDoctor } from "@/models/PatientDoctor";
import { User } from "@/models/User";
import { Analysis } from "@/models/Analysis";
import { EmotionSnapshot } from "@/models/EmotionSnapshot";
import { SessionNote } from "@/models/SessionNote";
import { AuditLog } from "@/models/AuditLog";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireDoctor(req);
  if (!isAuthed(auth)) return auth;

  await connectDB();
  const doctorId = auth.user.id;
  const { id: patientId } = await params;

  // Verify doctor-patient relationship
  const assignment = await PatientDoctor.findOne({
    doctorId,
    patientId,
    status: "active",
  });

  if (!assignment) {
    return NextResponse.json(
      { error: "Not authorized to view this patient" },
      { status: 403 }
    );
  }

  const [patient, analyses, snapshots, sessionNotes] = await Promise.all([
    User.findById(patientId, { name: 1, email: 1, createdAt: 1 }).lean(),

    Analysis.find({ userId: patientId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),

    EmotionSnapshot.find({ userId: patientId })
      .sort({ date: -1 })
      .limit(90)
      .lean(),

    SessionNote.find({ doctorId, patientId })
      .sort({ sessionDate: -1 })
      .limit(20)
      .lean(),
  ]);

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  // Compute summary stats
  const recentAnalyses = analyses.slice(0, 10);
  const disorderFrequency: Record<string, number> = {};
  const riskDistribution = { Low: 0, Medium: 0, High: 0 };

  for (const a of analyses) {
    const risk = a.riskLevel as keyof typeof riskDistribution;
    if (risk in riskDistribution) riskDistribution[risk]++;

    if (a.mlData?.labels) {
      for (const label of a.mlData.labels) {
        if (label !== "Normal") {
          disorderFrequency[label] = (disorderFrequency[label] || 0) + 1;
        }
      }
    }
  }

  // Average probabilities from recent analyses
  const avgProbabilities: Record<string, number> = {};
  if (recentAnalyses.length > 0) {
    for (const a of recentAnalyses) {
      if (a.mlData?.probabilities) {
        const probs =
          a.mlData.probabilities instanceof Map
            ? Object.fromEntries(a.mlData.probabilities)
            : a.mlData.probabilities;
        for (const [label, prob] of Object.entries(probs)) {
          avgProbabilities[label] =
            (avgProbabilities[label] || 0) + (prob as number);
        }
      }
    }
    for (const label of Object.keys(avgProbabilities)) {
      avgProbabilities[label] /= recentAnalyses.length;
    }
  }

  // Audit log
  await AuditLog.create({
    userId: doctorId,
    action: "view_patient",
    resource: "Patient",
    resourceId: patientId,
  });

  return NextResponse.json({
    patient: {
      id: patient._id,
      name: patient.name,
      email: patient.email,
      memberSince: patient.createdAt,
    },
    summary: {
      totalEntries: analyses.length,
      riskDistribution,
      disorderFrequency,
      avgProbabilities,
      latestRiskLevel: analyses[0]?.riskLevel || "Unknown",
      latestPrediction: analyses[0]?.prediction || "N/A",
      lastEntryDate: analyses[0]?.createdAt || null,
    },
    recentAnalyses: recentAnalyses.map((a) => ({
      id: a._id,
      prediction: a.prediction,
      confidence: a.confidence,
      riskLevel: a.riskLevel,
      explanation: a.explanation,
      mlData: a.mlData,
      crisisEscalation: a.crisisEscalation,
      createdAt: a.createdAt,
      text: a.text,
      originalText: a.originalText,
      detectedLanguage: a.detectedLanguage,
      wasTranslated: a.wasTranslated,
    })),
    emotionTimeline: snapshots,
    sessionNotes,
    assignment: {
      status: assignment.status,
      assignedAt: assignment.assignedAt,
      consentGiven: assignment.consentGiven,
    },
  });
}
