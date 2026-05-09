"use client";

import { useEffect, useState } from "react";
import { Users, AlertTriangle, ArrowRight, UserCircle } from "lucide-react";
import Link from "next/link";
import { doctorService } from "@/features/doctor/services/doctor.service";
import type { PatientListItem } from "@/features/doctor/types/doctor.types";
import Badge from "@/components/ui/Badge";
import { PREDICTION_VARIANT } from "@/constants/dashboard";

export default function ConnectedPatientsWidget() {
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await doctorService.getPatients();
        setPatients(res.patients || []);
      } catch (error) {
        console.error("Failed to load patients for widget", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-1/3 bg-[var(--surface-raised)] rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 w-full bg-[var(--surface-raised)] rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const highRiskPatients = patients.filter(p => p.latestRiskLevel === "High" || p.latestRiskLevel === "Critical");

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-raised)]/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-blue-500" />
          <h2 className="text-sm font-bold text-[var(--text)] tracking-wide">Connected Patients</h2>
        </div>
        <Link href="/doctor/patients" className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1 group">
          View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-[var(--bg)] border-b border-[var(--border)]">
        <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Total Patients</p>
            <p className="text-2xl font-bold text-[var(--text)]">{patients.length}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Users size={24} />
          </div>
        </div>
        <div className="bg-[var(--surface)] p-4 rounded-xl border border-rose-500/20 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-1">High Risk Attention</p>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{highRiskPatients.length}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {patients.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-sm text-[var(--text-muted)]">No patients connected yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border)]">
          {patients.slice(0, 5).map(patient => (
            <Link 
              href={`/doctor/patients/${patient.id}`} 
              key={patient.id}
              className="flex items-center justify-between px-6 py-4 hover:bg-[var(--surface-raised)] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-[var(--text-secondary)]">
                  <UserCircle size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--text)]">{patient.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {patient.lastAnalysisDate 
                      ? `Last active: ${new Date(patient.lastAnalysisDate).toLocaleDateString()}` 
                      : "No recent activity"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {patient.latestPrediction && (
                  <>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Badge variant={(PREDICTION_VARIANT[patient.latestPrediction] as any) || "default"}>
                      {patient.latestPrediction}
                    </Badge>
                  </>
                )}
                <ArrowRight size={16} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
