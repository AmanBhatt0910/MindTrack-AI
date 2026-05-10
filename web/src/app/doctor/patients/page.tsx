"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Search,
  UserPlus,
  X,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { doctorService } from "@/features/doctor/services/doctor.service";
import type { PatientListItem } from "@/features/doctor/types/doctor.types";
import { toast } from "sonner";
import Button from "@/components/ui/Button";

const riskColor: Record<string, string> = {
  High: "bg-red-500/15 text-red-400",
  Medium: "bg-amber-500/15 text-amber-400",
  Low: "bg-emerald-500/15 text-emerald-400",
  Unknown: "bg-gray-500/15 text-gray-400",
};

const riskDot: Record<string, string> = {
  High: "bg-red-500",
  Medium: "bg-amber-500",
  Low: "bg-emerald-500",
  Unknown: "bg-gray-500",
};

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAssign, setShowAssign] = useState(false);
  const [assignEmail, setAssignEmail] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await doctorService.getPatients();
      setPatients(data.patients);
    } catch (err) {
      console.error("Failed to load patients:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!assignEmail.trim()) return;
    setAssigning(true);
    try {
      await doctorService.assignPatient(assignEmail.trim());
      toast.success("Patient assigned successfully");
      setAssignEmail("");
      setShowAssign(false);
      loadPatients();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to assign patient");
    } finally {
      setAssigning(false);
    }
  };

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="shimmer h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ─── Header Actions ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-active)]"
          />
        </div>
        <Button
          onClick={() => setShowAssign(true)}
          icon={<UserPlus size={16} />}
        >
          Add Patient
        </Button>
      </div>

      {/* ─── Assign Modal ────────────────────────────────────────── */}
      {showAssign && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg shadow-black/5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[var(--text)] flex items-center gap-2">
              <UserPlus size={18} className="text-[var(--accent)]" />
              Assign New Patient
            </h3>
            <button onClick={() => setShowAssign(false)} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer p-1 rounded-md hover:bg-[var(--surface-raised)]">
              <X size={18} />
            </button>
          </div>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="Enter patient's registered email address..."
              value={assignEmail}
              onChange={(e) => setAssignEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAssign()}
              className="flex-1 px-4 py-2.5 rounded-[var(--radius-md)] bg-[var(--bg)] border border-[var(--border)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-active)]"
            />
            <Button
              onClick={handleAssign}
              disabled={assigning || !assignEmail.trim()}
              loading={assigning}
            >
              Assign Request
            </Button>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-3">
            The patient must already have a MindTrack account. They will receive a connection request they must accept.
          </p>
        </motion.div>
      )}

      {/* ─── Patient List ────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <UserPlus size={40} className="mx-auto mb-3 text-(--text-muted) opacity-40" />
          <p className="text-sm text-(--text-muted)">
            {patients.length === 0
              ? "No patients assigned yet. Click \"Add Patient\" to get started."
              : "No patients match your search."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((patient, i) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => router.push(`/doctor/patients/${patient.id}`)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-(--border) bg-(--surface) hover:bg-(--surface-raised) hover:border-(--border-active) transition-all cursor-pointer text-left group"
            >
              {/* Risk indicator */}
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${riskDot[patient.latestRiskLevel] || riskDot.Unknown} ${
                patient.latestRiskLevel === "High" ? "animate-pulse" : ""
              }`} />

              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/20 flex items-center justify-center text-emerald-400 text-sm font-bold shrink-0">
                {patient.name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-(--text) group-hover:text-emerald-400 transition-colors truncate">
                  {patient.name}
                </p>
                <p className="text-xs text-(--text-muted) truncate">{patient.email}</p>
              </div>

              {/* Stats */}
              <div className="hidden sm:flex items-center gap-4 text-xs text-(--text-muted)">
                <span>{patient.totalEntries} entries</span>
                {patient.lastAnalysisDate && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(patient.lastAnalysisDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Risk badge / Accept button */}
              {patient.assignmentStatus === "pending" ? (
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      await doctorService.acceptPatient(patient.id);
                      toast.success("Patient request accepted");
                      loadPatients();
                    } catch (err) {
                      toast.error("Failed to accept patient");
                    }
                  }}
                  className="px-3 py-1 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Accept
                </button>
              ) : (
                <>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${riskColor[patient.latestRiskLevel] || riskColor.Unknown}`}>
                    {patient.latestRiskLevel}
                  </span>
                  <ChevronRight size={16} className="text-(--text-muted) group-hover:text-emerald-400 transition-colors" />
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
