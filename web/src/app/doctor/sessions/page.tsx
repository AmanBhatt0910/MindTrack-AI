"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  X,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { doctorService } from "@/features/doctor/services/doctor.service";
import type { SessionNote, PatientListItem } from "@/features/doctor/types/doctor.types";
import { toast } from "sonner";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionNote[]>([]);
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [form, setForm] = useState({
    patientId: "",
    noteContent: "",
    moodAtSession: "neutral",
    riskAssessment: "Low",
    primaryConcerns: "",
    followUpRequired: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [sessData, patData] = await Promise.all([
          doctorService.getSessions(),
          doctorService.getPatients(),
        ]);
        setSessions(sessData.sessions);
        setPatients(patData.patients);
      } catch (err) {
        console.error("Failed to load sessions:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async () => {
    if (!form.patientId || !form.noteContent.trim()) {
      toast.error("Please select a patient and enter notes");
      return;
    }
    setSubmitting(true);
    try {
      await doctorService.createSession({
        patientId: form.patientId,
        noteContent: form.noteContent,
        moodAtSession: form.moodAtSession,
        riskAssessment: form.riskAssessment,
        primaryConcerns: form.primaryConcerns.split(",").map((s) => s.trim()).filter(Boolean),
        followUpRequired: form.followUpRequired,
      });
      toast.success("Session note created");
      setShowForm(false);
      setForm({ patientId: "", noteContent: "", moodAtSession: "neutral", riskAssessment: "Low", primaryConcerns: "", followUpRequired: false });
      const data = await doctorService.getSessions();
      setSessions(data.sessions);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create session note");
    } finally {
      setSubmitting(false);
    }
  };

  const patientNameMap = new Map(patients.map((p) => [p.id, p.name]));

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="shimmer h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-(--text-muted)">{sessions.length} session notes</p>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Plus size={16} />
          New Session Note
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-emerald-500/30 bg-(--surface) p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-(--text)">New Session Note</h3>
            <button onClick={() => setShowForm(false)} className="text-(--text-muted) hover:text-(--text) cursor-pointer">
              <X size={18} />
            </button>
          </div>

          {/* Patient Select */}
          <div>
            <label className="text-xs text-(--text-muted) block mb-1">Patient</label>
            <select
              value={form.patientId}
              onChange={(e) => setForm({ ...form, patientId: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg bg-(--bg) border border-(--border) text-sm text-(--text) focus:outline-none focus:border-emerald-500/50"
            >
              <option value="">Select patient...</option>
              {patients.filter((p) => p.assignmentStatus === "active").map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
              ))}
            </select>
          </div>

          {/* Note Content */}
          <div>
            <label className="text-xs text-(--text-muted) block mb-1">Session Notes</label>
            <textarea
              value={form.noteContent}
              onChange={(e) => setForm({ ...form, noteContent: e.target.value })}
              rows={5}
              placeholder="Document session observations, patient state, and therapeutic approach..."
              className="w-full px-3 py-2.5 rounded-lg bg-(--bg) border border-(--border) text-sm text-(--text) placeholder:text-(--text-muted) focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>

          {/* Row: Mood + Risk + Follow-up */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-(--text-muted) block mb-1">Mood at Session</label>
              <select
                value={form.moodAtSession}
                onChange={(e) => setForm({ ...form, moodAtSession: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg bg-(--bg) border border-(--border) text-sm text-(--text) focus:outline-none"
              >
                <option value="very_low">Very Low</option>
                <option value="low">Low</option>
                <option value="neutral">Neutral</option>
                <option value="good">Good</option>
                <option value="excellent">Excellent</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-(--text-muted) block mb-1">Risk Assessment</label>
              <select
                value={form.riskAssessment}
                onChange={(e) => setForm({ ...form, riskAssessment: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg bg-(--bg) border border-(--border) text-sm text-(--text) focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.followUpRequired}
                  onChange={(e) => setForm({ ...form, followUpRequired: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-(--text-secondary)">Follow-up required</span>
              </label>
            </div>
          </div>

          {/* Concerns */}
          <div>
            <label className="text-xs text-(--text-muted) block mb-1">Primary Concerns (comma-separated)</label>
            <input
              type="text"
              value={form.primaryConcerns}
              onChange={(e) => setForm({ ...form, primaryConcerns: e.target.value })}
              placeholder="anxiety, sleep issues, social withdrawal..."
              className="w-full px-3 py-2.5 rounded-lg bg-(--bg) border border-(--border) text-sm text-(--text) placeholder:text-(--text-muted) focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {submitting ? "Saving..." : "Save Session Note"}
          </button>
        </motion.div>
      )}

      {/* Session List */}
      {sessions.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={40} className="mx-auto mb-3 text-(--text-muted) opacity-40" />
          <p className="text-sm text-(--text-muted)">No session notes yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((note, i) => (
            <motion.div
              key={note._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl border border-(--border) bg-(--surface) p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-(--text-muted)" />
                  <span className="text-sm font-medium text-(--text)">
                    {new Date(note.sessionDate).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-(--text-muted)">
                    {patientNameMap.get(note.patientId) || `Patient ${note.patientId.slice(-6)}`}
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
              <p className="text-sm text-(--text-secondary) whitespace-pre-wrap line-clamp-3">{note.noteContent}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
