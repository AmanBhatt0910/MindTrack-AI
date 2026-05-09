/**
 * AI Risk Trend API
 * GET /api/ai/risk-trend?patientId=xxx — Temporal risk analysis for a patient
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireDoctor, isAuthed } from "@/lib/rbac";
import { PatientDoctor } from "@/models/PatientDoctor";
import { Analysis } from "@/models/Analysis";
import { EmotionSnapshot } from "@/models/EmotionSnapshot";

export async function GET(req: Request) {
  const auth = requireDoctor(req);
  if (!isAuthed(auth)) return auth;

  await connectDB();
  const doctorId = auth.user.id;
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patientId");

  if (!patientId) {
    return NextResponse.json({ error: "patientId required" }, { status: 400 });
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

  const [analyses, snapshots] = await Promise.all([
    Analysis.find({ userId: patientId })
      .sort({ createdAt: -1 })
      .limit(60)
      .lean(),
    EmotionSnapshot.find({ userId: patientId })
      .sort({ date: -1 })
      .limit(90)
      .lean(),
  ]);

  // Compute risk scores over time
  const riskTimeline = analyses.map((a) => {
    const probs =
      a.mlData?.probabilities instanceof Map
        ? Object.fromEntries(a.mlData.probabilities)
        : a.mlData?.probabilities || {};

    return {
      date: a.createdAt,
      riskLevel: a.riskLevel,
      prediction: a.prediction,
      confidence: a.confidence,
      probabilities: probs,
      crisisEscalation: a.crisisEscalation || false,
    };
  });

  // Detect spikes (>30% increase in any disorder probability)
  const alerts: { date: Date; disorder: string; change: number; from: number; to: number }[] = [];
  for (let i = 0; i < riskTimeline.length - 1; i++) {
    const current = riskTimeline[i];
    const previous = riskTimeline[i + 1]; // older entry
    if (!current.probabilities || !previous.probabilities) continue;

    for (const disorder of Object.keys(current.probabilities)) {
      const currentProb = (current.probabilities as Record<string, number>)[disorder] || 0;
      const previousProb = (previous.probabilities as Record<string, number>)[disorder] || 0;
      const change = currentProb - previousProb;

      if (change > 0.3) {
        alerts.push({
          date: current.date as Date,
          disorder,
          change: Math.round(change * 100),
          from: Math.round(previousProb * 100),
          to: Math.round(currentProb * 100),
        });
      }
    }
  }

  // Determine overall trend
  let trend: "improving" | "stable" | "worsening" = "stable";
  if (riskTimeline.length >= 3) {
    const recent = riskTimeline.slice(0, 3);
    const older = riskTimeline.slice(Math.max(0, riskTimeline.length - 3));

    const avgRecent =
      recent.reduce((sum, r) => sum + (r.confidence || 0), 0) / recent.length;
    const avgOlder =
      older.reduce((sum, r) => sum + (r.confidence || 0), 0) / older.length;

    const diff = avgRecent - avgOlder;
    if (diff > 0.15) trend = "worsening";
    else if (diff < -0.15) trend = "improving";
  }

  return NextResponse.json({
    trend,
    totalEntries: analyses.length,
    riskTimeline: riskTimeline.reverse(), // chronological order
    emotionTimeline: snapshots.reverse(),
    alerts,
  });
}
