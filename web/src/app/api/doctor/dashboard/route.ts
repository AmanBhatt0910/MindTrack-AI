/**
 * Doctor Dashboard API
 * GET /api/doctor/dashboard — Aggregate stats for the logged-in doctor
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireDoctor, isAuthed } from "@/lib/rbac";
import { PatientDoctor } from "@/models/PatientDoctor";
import { Analysis } from "@/models/Analysis";
import { Notification } from "@/models/Notification";
import { SessionNote } from "@/models/SessionNote";

export async function GET(req: Request) {
  const auth = requireDoctor(req);
  if (!isAuthed(auth)) return auth;

  await connectDB();
  const doctorId = auth.user.id;

  // Get active patient IDs
  const assignments = await PatientDoctor.find({
    doctorId,
    status: "active",
  }).lean();
  const patientIds = assignments.map((a) => a.patientId);

  // Recent high-risk analyses from assigned patients (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalPatients,
    highRiskAnalyses,
    unreadNotifications,
    recentSessions,
    crisisAlerts,
  ] = await Promise.all([
    patientIds.length,

    Analysis.countDocuments({
      userId: { $in: patientIds.map(String) },
      riskLevel: "High",
      createdAt: { $gte: sevenDaysAgo },
    }),

    Notification.countDocuments({
      userId: doctorId,
      read: false,
    }),

    SessionNote.countDocuments({
      doctorId,
      createdAt: { $gte: sevenDaysAgo },
    }),

    Notification.countDocuments({
      userId: doctorId,
      type: "crisis_alert",
      read: false,
    }),
  ]);

  // Get recent high-risk patients with their latest analysis
  const highRiskPatientAnalyses = await Analysis.aggregate([
    {
      $match: {
        userId: { $in: patientIds.map(String) },
        riskLevel: "High",
        createdAt: { $gte: sevenDaysAgo },
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$userId",
        latestAnalysis: { $first: "$$ROOT" },
      },
    },
    { $limit: 10 },
  ]);

  return NextResponse.json({
    stats: {
      totalPatients,
      highRiskCount: highRiskAnalyses,
      unreadNotifications,
      recentSessions,
      crisisAlerts,
    },
    highRiskPatients: highRiskPatientAnalyses.map((p) => ({
      patientId: p._id,
      prediction: p.latestAnalysis.prediction,
      riskLevel: p.latestAnalysis.riskLevel,
      confidence: p.latestAnalysis.confidence,
      date: p.latestAnalysis.createdAt,
    })),
  });
}
