"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  FileText,
  Calendar,
  Sparkles,
  Loader2,
  Shield,
  Info,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { doctorService } from "@/features/doctor/services/doctor.service";
import type {
  PatientDetail,
  ClinicalSummary,
  RiskTrendData,
} from "@/features/doctor/types/doctor.types";
import PostAnalyzer from "@/features/dashboard/components/PostAnalyzer";
import type { AnalysisResponse } from "@/features/posts/types/post.types";
import { api } from "@/lib/axios";
import Button from "@/components/ui/Button";

interface PatientPostType {
  _id: string;
  content: string;
  allowDoctorAnalysis: boolean;
  analyzed: boolean;
  analysisId?: string;
  createdAt: string;
}

const RISK_COLORS: Record<string, string> = {
  High: "#ef4444",
  Medium: "#f59e0b",
  Low: "#10b981",
};

/**
 * Strip BERT-style sub-word markers so the rendered tokens read like words.
 * Handles `##ing` (BERT), `▁` (SentencePiece) and the leading-space `Ġ`
 * (GPT-2 / RoBERTa BPE) that the model's occlusion explainer can emit.
 */
function cleanShapToken(raw: string): { display: string; leadsWord: boolean } {
  if (!raw) return { display: "", leadsWord: false };
  if (raw.startsWith("##")) return { display: raw.slice(2), leadsWord: false };
  if (raw.startsWith("▁")) return { display: raw.slice(1), leadsWord: true };
  if (raw.startsWith("Ġ")) return { display: raw.slice(1), leadsWord: true };
  return { display: raw, leadsWord: true };
}

interface ShapData {
  tokens: string[];
  scores: number[];
}

function ShapExplanation({ data, label }: { data: ShapData; label: string }) {
  const maxAbs = Math.max(
    1e-6,
    ...data.scores.map((s) => Math.abs(s))
  );

  return (
    <div className="mt-3 rounded-lg border border-(--border) bg-(--surface-raised)/40 p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-medium text-(--text) flex items-center gap-1.5">
          <Brain size={12} className="text-purple-400" />
          Why the model predicted <span className="text-purple-300">{label}</span>
        </p>
        <div className="flex items-center gap-2 text-[10px] text-(--text-muted)">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-500/60" />
            increases
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-500/60" />
            decreases
          </span>
        </div>
      </div>

      <div className="leading-7 text-[13px] text-(--text)">
        {data.tokens.map((rawToken, i) => {
          const { display, leadsWord } = cleanShapToken(rawToken);
          if (!display.trim()) return null;
          const score = data.scores[i] ?? 0;
          const intensity = Math.min(1, Math.abs(score) / maxAbs);
          const isPositive = score > 0;
          // Tailwind can't generate dynamic alpha values at runtime, so use inline style.
          const bg = isPositive
            ? `rgba(239, 68, 68, ${0.08 + intensity * 0.42})`
            : `rgba(59, 130, 246, ${0.08 + intensity * 0.42})`;
          return (
            <span key={i}>
              {leadsWord && i > 0 ? " " : ""}
              <span
                title={`${display}: ${score >= 0 ? "+" : ""}${score.toFixed(3)}`}
                className="rounded px-0.5 py-0.5 transition-colors"
                style={{ backgroundColor: bg }}
              >
                {display}
              </span>
            </span>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-(--text-muted) italic">
        Hover any token to see its contribution to the prediction. Scores are leave-one-out
        deltas in the model's confidence for {label}.
      </p>
    </div>
  );
}

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [detail, setDetail] = useState<PatientDetail | null>(null);
  const [riskTrend, setRiskTrend] = useState<RiskTrendData | null>(null);
  const [clinicalSummary, setClinicalSummary] = useState<ClinicalSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [analyzingPostId, setAnalyzingPostId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "analyses" | "posts" | "sessions">("overview");
  const [patientPosts, setPatientPosts] = useState<PatientPostType[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [detailData, trendData, postsRes] = await Promise.all([
          doctorService.getPatientDetail(patientId),
          doctorService.getRiskTrend(patientId),
          api.get(`/patient-posts?patientId=${patientId}`)
        ]);
        setDetail(detailData);
        setRiskTrend(trendData);
        setPatientPosts(postsRes.data);
      } catch (err) {
        console.error("Failed to load patient:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patientId]);

  const generateSummary = async () => {
    setSummaryLoading(true);
    try {
      const data = await doctorService.getClinicalSummary(patientId);
      setClinicalSummary(data.summary);
    } catch (err) {
      console.error("Summary generation failed:", err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleAnalyzePost = async (post: PatientPostType) => {
    setAnalyzingPostId(post._id);
    try {
      const res = await api.post("/analysis", {
        text: post.content,
        language: "auto",
        patientId
      });

      const analysisData = res.data;

      if (!analysisData.error) {
        await api.patch(`/patient-posts/${post._id}`, {
          analysisId: analysisData._id
        });

        const updatedDetail = await doctorService.getPatientDetail(patientId);
        setDetail(updatedDetail);

        setPatientPosts(prev => prev.map(p => p._id === post._id ? { ...p, analyzed: true, analysisId: analysisData._id } : p));

        // Jump to the Analyses tab so the doctor sees the new entry immediately.
        setActiveTab("analyses");
      }
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setAnalyzingPostId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="shimmer h-10 w-48 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="shimmer h-32 rounded-xl" />
          ))}
        </div>
        <div className="shimmer h-80 rounded-xl" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-(--text-muted)">Patient not found or access denied.</p>
        <button onClick={() => router.back()} className="mt-4 text-emerald-400 text-sm cursor-pointer hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const { patient, summary, recentAnalyses, sessionNotes } = detail;
  const trendIcon = riskTrend?.trend === "improving" ? TrendingDown : riskTrend?.trend === "worsening" ? TrendingUp : Minus;
  const trendColor = riskTrend?.trend === "improving" ? "text-emerald-400" : riskTrend?.trend === "worsening" ? "text-red-400" : "text-amber-400";

  // Chart data for disorder probabilities
  const probChartData = Object.entries(summary.avgProbabilities).map(([label, value]) => ({
    label,
    value: Math.round(value * 100),
  }));

  // Timeline chart data
  const timelineData = riskTrend?.riskTimeline.slice(-20).map((entry) => ({
    date: new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    confidence: Math.round(entry.confidence * 100),
    risk: entry.riskLevel === "High" ? 100 : entry.riskLevel === "Medium" ? 60 : 20,
  })) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-(--surface) transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} className="text-(--text-secondary)" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-(--text)">{patient.name}</h1>
          <p className="text-xs text-(--text-muted)">{patient.email} · Member since {new Date(patient.memberSince).toLocaleDateString()}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
          summary.latestRiskLevel === "High" ? "bg-red-500/15 text-red-400" :
          summary.latestRiskLevel === "Medium" ? "bg-amber-500/15 text-amber-400" :
          "bg-emerald-500/15 text-emerald-400"
        }`}>
          {summary.latestRiskLevel} Risk
        </span>
      </div>

      {/* ─── Stats Row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Entries", value: summary.totalEntries, color: "text-blue-400" },
          { label: "Latest Prediction", value: summary.latestPrediction, color: "text-purple-400" },
          {
            label: "Risk Trend",
            value: riskTrend?.trend ? riskTrend.trend.charAt(0).toUpperCase() + riskTrend.trend.slice(1) : "N/A",
            color: trendColor,
            Icon: trendIcon,
          },
          {
            label: "Risk Distribution",
            value: `${summary.riskDistribution.High}H / ${summary.riskDistribution.Medium}M / ${summary.riskDistribution.Low}L`,
            color: "text-amber-400",
          },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl border border-(--border) bg-(--surface)">
            <p className="text-[10px] text-(--text-muted) uppercase tracking-wide mb-1">{stat.label}</p>
            <div className="flex items-center gap-1.5">
              {stat.Icon && <stat.Icon size={16} className={stat.color} />}
              <p className={`text-lg font-semibold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Tab Navigation ──────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-(--border)">
        {(["overview", "posts", "analyses", "sessions"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === tab
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-(--text-muted) hover:text-(--text)"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ─── Overview Tab ────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Disorder Probabilities Chart */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-(--border) bg-(--surface) p-5"
          >
            <h3 className="text-sm font-semibold text-(--text) mb-4 flex items-center gap-2">
              <Brain size={16} className="text-purple-400" />
              Average Disorder Probabilities
            </h3>
            {probChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={probChartData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#8b98a9" }} />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: "#8b98a9" }} width={80} />
                  <Tooltip
                    contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "#f0f4f8" }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-(--text-muted) text-center py-8">No data available</p>
            )}
          </motion.div>

          {/* Risk Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-(--border) bg-(--surface) p-5"
          >
            <h3 className="text-sm font-semibold text-(--text) mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-400" />
              Risk Timeline
            </h3>
            {timelineData.length > 1 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8b98a9" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#8b98a9" }} />
                  <Tooltip
                    contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, fontSize: 12 }}
                  />
                  <Line type="monotone" dataKey="confidence" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-(--text-muted) text-center py-8">Not enough data for trend chart</p>
            )}
          </motion.div>

          {/* AI Clinical Summary */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 rounded-xl border border-(--border) bg-(--surface) p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-(--text) flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                AI Clinical Summary
              </h3>
              {!clinicalSummary && (
                <button
                  onClick={generateSummary}
                  disabled={summaryLoading}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/12 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {summaryLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {summaryLoading ? "Generating..." : "Generate Summary"}
                </button>
              )}
            </div>

            {/* AI Disclaimer */}
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-500/8 border border-amber-500/20 mb-4">
              <Info size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-300/80">
                AI-generated clinical summary. This is a decision support tool and does not replace professional clinical judgment.
              </p>
            </div>

            {clinicalSummary ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-(--text-muted) uppercase tracking-wide mb-1">Primary Concerns</p>
                  <div className="flex flex-wrap gap-2">
                    {clinicalSummary.primaryConcerns.map((c, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs">{c}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-(--text-muted) uppercase tracking-wide mb-1">Symptom Progression</p>
                  <p className="text-sm text-(--text-secondary)">{clinicalSummary.symptomProgression}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-(--text-muted) uppercase tracking-wide mb-1">Risk Trajectory</p>
                    <p className={`text-sm font-medium ${
                      clinicalSummary.riskTrajectory === "worsening" ? "text-red-400" :
                      clinicalSummary.riskTrajectory === "improving" ? "text-emerald-400" : "text-amber-400"
                    }`}>
                      {clinicalSummary.riskTrajectory}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-(--text-muted) uppercase tracking-wide mb-1">Current Risk Level</p>
                    <p className="text-sm font-medium text-(--text)">{clinicalSummary.currentRiskLevel}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-(--text-muted) uppercase tracking-wide mb-1">Recommended Focus Areas</p>
                  <ul className="space-y-1">
                    {clinicalSummary.recommendedFocusAreas.map((area, i) => (
                      <li key={i} className="text-sm text-(--text-secondary) flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : !summaryLoading ? (
              <p className="text-sm text-(--text-muted) text-center py-4">
                Click &quot;Generate Summary&quot; to create an AI-powered clinical overview.
              </p>
            ) : null}
          </motion.div>
        </div>
      )}

      {/* ─── Analyses Tab ────────────────────────────────────────── */}
      {activeTab === "analyses" && (
        <div className="space-y-6">
          <PostAnalyzer 
            patientId={patientId}
            onAnalysisComplete={(analysis) => {
              // Refresh data or prepend to local state
              doctorService.getPatientDetail(patientId).then(d => {
                setDetail(d);
              });
            }}
          />
          
          <div className="space-y-3">
            {recentAnalyses.length === 0 ? (
            <p className="text-sm text-(--text-muted) text-center py-8">No analysis entries yet.</p>
          ) : (
            recentAnalyses.map((a) => (
              <div
                key={a.id}
                className={`rounded-xl border bg-(--surface) p-4 ${
                  a.crisisEscalation ? "border-red-500/40 bg-red-500/5" : "border-(--border)"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {a.crisisEscalation && <AlertTriangle size={14} className="text-red-400" />}
                    <span className="text-sm font-medium text-(--text)">{a.prediction}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      a.riskLevel === "High" ? "bg-red-500/15 text-red-400" :
                      a.riskLevel === "Medium" ? "bg-amber-500/15 text-amber-400" :
                      "bg-emerald-500/15 text-emerald-400"
                    }`}>
                      {a.riskLevel}
                    </span>
                  </div>
                  <span className="text-xs text-(--text-muted)">
                    {new Date(a.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Probabilities */}
                <div className="flex flex-wrap gap-3 mt-2">
                  {a.mlData?.probabilities && Object.entries(a.mlData.probabilities).map(([label, prob]) => (
                    <div key={label} className="text-xs">
                      <span className="text-(--text-muted)">{label}:</span>{" "}
                      <span className={`font-medium ${prob > 0.5 ? "text-red-400" : prob > 0.3 ? "text-amber-400" : "text-(--text-secondary)"}`}>
                        {(prob * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>

                {/* Source text the prediction was made from */}
                {(a.text || a.originalText) && (
                  <div className="mt-3 rounded-lg border border-(--border) bg-(--surface-raised)/40 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[11px] font-medium text-(--text) flex items-center gap-1.5">
                        <FileText size={12} className="text-(--text-muted)" />
                        Patient text analyzed
                      </p>
                      {a.wasTranslated && a.detectedLanguage && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300">
                          translated from {a.detectedLanguage}
                        </span>
                      )}
                    </div>
                    {a.wasTranslated && a.originalText ? (
                      <div className="space-y-2">
                        <p className="text-[12px] text-(--text-secondary) whitespace-pre-wrap">
                          <span className="text-[10px] uppercase tracking-wide text-(--text-muted) block mb-0.5">Original</span>
                          {a.originalText}
                        </p>
                        <p className="text-[12px] text-(--text) whitespace-pre-wrap">
                          <span className="text-[10px] uppercase tracking-wide text-(--text-muted) block mb-0.5">Analyzed (English)</span>
                          {a.text}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[12px] text-(--text) whitespace-pre-wrap">{a.text || a.originalText}</p>
                    )}
                  </div>
                )}

                {/* Explainable AI: token-level SHAP-style attribution */}
                {a.mlData?.shapData?.tokens?.length ? (
                  <ShapExplanation
                    data={a.mlData.shapData}
                    label={a.prediction}
                  />
                ) : null}

                {/* Explanation */}
                {a.explanation && a.explanation.length > 0 && (
                  <p className="text-xs text-(--text-muted) mt-2 italic">{a.explanation[0]}</p>
                )}
              </div>
            ))
          )}
          </div>
        </div>
      )}

      {/* ─── Posts Tab ───────────────────────────────────────────── */}
      {activeTab === "posts" && (
        <div className="space-y-4">
          {patientPosts.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={32} className="mx-auto mb-2 text-(--text-muted) opacity-40" />
              <p className="text-sm text-(--text-muted)">No shared posts available from this patient.</p>
            </div>
          ) : (
            patientPosts.map((post) => (
              <div key={post._id} className="rounded-xl border border-(--border) bg-(--surface) p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs text-(--text-muted)">
                    <Calendar size={14} />
                    {new Date(post.createdAt).toLocaleString()}
                  </div>
                  {post.analyzed ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                      <Sparkles size={12} /> Analyzed
                    </span>
                  ) : (
                    <Button 
                      variant="primary" 
                      onClick={() => handleAnalyzePost(post)}
                      disabled={analyzingPostId === post._id}
                      loading={analyzingPostId === post._id}
                      className="!py-1.5 !px-3 !text-xs"
                      icon={<Sparkles size={12} />}
                    >
                      Analyze Post
                    </Button>
                  )}
                </div>
                <p className="text-sm text-(--text) whitespace-pre-wrap">{post.content}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* ─── Sessions Tab ────────────────────────────────────────── */}
      {activeTab === "sessions" && (
        <div className="space-y-3">
          {sessionNotes.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={32} className="mx-auto mb-2 text-(--text-muted) opacity-40" />
              <p className="text-sm text-(--text-muted)">No session notes yet for this patient.</p>
              <button
                onClick={() => router.push("/doctor/sessions")}
                className="mt-3 text-emerald-400 text-sm hover:text-emerald-300 cursor-pointer"
              >
                Create Session Note →
              </button>
            </div>
          ) : (
            sessionNotes.map((note) => (
              <div key={note._id} className="rounded-xl border border-(--border) bg-(--surface) p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-(--text-muted)" />
                    <span className="text-sm font-medium text-(--text)">
                      {new Date(note.sessionDate).toLocaleDateString()}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      note.riskAssessment === "High" ? "bg-red-500/15 text-red-400" :
                      note.riskAssessment === "Medium" ? "bg-amber-500/15 text-amber-400" :
                      "bg-emerald-500/15 text-emerald-400"
                    }`}>
                      {note.riskAssessment}
                    </span>
                    {note.followUpRequired && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400">Follow-up</span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-(--text-secondary) whitespace-pre-wrap">{note.noteContent}</p>
                {note.primaryConcerns.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {note.primaryConcerns.map((c, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-(--surface-raised) text-(--text-muted)">{c}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
