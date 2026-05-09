/**
 * AI Clinical Summary API
 * POST /api/ai/clinical-summary — Generate clinician-readable patient summary
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireDoctor, isAuthed } from "@/lib/rbac";
import { PatientDoctor } from "@/models/PatientDoctor";
import { Analysis } from "@/models/Analysis";
import { User } from "@/models/User";
import { AuditLog } from "@/models/AuditLog";

const CLINICAL_PROMPT = `You are a clinical decision support system for mental health professionals.

Given the following patient analysis history, generate a structured clinical summary.

Patient Name: {patient_name}
Number of Journal Entries: {entry_count}
Date Range: {date_range}

Analysis History (most recent first):
{analysis_data}

Generate a structured JSON response (no markdown, just JSON):
{
  "primaryConcerns": ["list of primary mental health concerns identified"],
  "symptomProgression": "2-3 sentence description of how symptoms have evolved",
  "riskTrajectory": "improving | stable | worsening",
  "currentRiskLevel": "Low | Medium | High",
  "keyPatterns": ["notable patterns in journal entries"],
  "recommendedFocusAreas": ["suggested therapeutic focus areas"],
  "confidenceNote": "brief note on data sufficiency and confidence",
  "ethicalDisclaimer": "AI-generated summary. Not a substitute for clinical judgment."
}

IMPORTANT:
- Use clinical language appropriate for mental health professionals
- Be specific about observed patterns
- Note any data limitations
- Do NOT diagnose — describe observed patterns
- Include confidence caveats`;

export async function POST(req: Request) {
  const auth = requireDoctor(req);
  if (!isAuthed(auth)) return auth;

  await connectDB();
  const doctorId = auth.user.id;
  const { patientId } = await req.json();

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

  const [patient, analyses] = await Promise.all([
    User.findById(patientId, { name: 1 }).lean(),
    Analysis.find({ userId: patientId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean(),
  ]);

  if (!patient || analyses.length === 0) {
    return NextResponse.json({
      summary: null,
      message: "Insufficient data for clinical summary",
    });
  }

  // Format analysis data for prompt
  const analysisData = analyses
    .map((a, i) => {
      const probs = a.mlData?.probabilities instanceof Map
        ? Object.fromEntries(a.mlData.probabilities)
        : a.mlData?.probabilities || {};
      const labelsStr = Array.isArray(a.mlData?.labels) ? a.mlData.labels.join(", ") : "N/A";
      const probsStr = Object.keys(probs).length > 0 
        ? Object.entries(probs).map(([k, v]) => `${k}:${((v as number) * 100).toFixed(0)}%`).join(", ")
        : "N/A";
        
      return `Entry ${i + 1} (${new Date(a.createdAt as Date).toLocaleDateString()}):
  Risk: ${a.riskLevel || "Unknown"} | Prediction: ${a.prediction || "Unknown"} | Confidence: ${((a.confidence || 0) * 100).toFixed(1)}%
  Labels: ${labelsStr}
  Probabilities: ${probsStr}
  Crisis: ${a.crisisEscalation ? "YES" : "No"}`;
    })
    .join("\n\n");

  const dateRange = `${new Date(analyses[analyses.length - 1].createdAt as Date).toLocaleDateString()} to ${new Date(analyses[0].createdAt as Date).toLocaleDateString()}`;

  const prompt = CLINICAL_PROMPT
    .replace("{patient_name}", patient.name)
    .replace("{entry_count}", analyses.length.toString())
    .replace("{date_range}", dateRange)
    .replace("{analysis_data}", analysisData);

  // Call Gemini
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini API key not configured" },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 800,
        },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error(`Gemini API failed with status ${res.status}:`, errText);
    throw new Error(`Gemini API failed: ${res.status}`);
  }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse JSON from response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    let summary = null;
    if (jsonMatch) {
      try {
        summary = JSON.parse(jsonMatch[0]);
      } catch {
        summary = { rawText, parseError: true };
      }
    }

    await AuditLog.create({
      userId: doctorId,
      action: "generate_summary",
      resource: "Patient",
      resourceId: patientId,
    });

    return NextResponse.json({
      summary,
      metadata: {
        entriesAnalyzed: analyses.length,
        dateRange,
        generatedAt: new Date().toISOString(),
        disclaimer:
          "AI-generated clinical summary. This is a decision support tool and does not replace professional clinical judgment.",
      },
    });
  } catch (error) {
    console.error("Clinical summary generation failed:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate clinical summary", 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
