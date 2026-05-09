"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  AlertTriangle,
  FileText,
  Shield,
  Activity,
  ArrowRight,
  Bell,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { doctorService } from "@/features/doctor/services/doctor.service";
import type { DashboardData, AlertItem } from "@/features/doctor/types/doctor.types";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashData, alertData] = await Promise.all([
          doctorService.getDashboard(),
          doctorService.getAlerts(true),
        ]);
        setData(dashData);
        setAlerts(alertData.alerts.slice(0, 5));
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="shimmer h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="shimmer h-80 rounded-xl" />
          <div className="shimmer h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  const stats = data?.stats;
  const statCards = [
    {
      label: "Total Patients",
      value: stats?.totalPatients ?? 0,
      icon: Users,
      color: "from-emerald-500 to-teal-600",
      bgGlow: "bg-emerald-500/8",
    },
    {
      label: "High Risk (7d)",
      value: stats?.highRiskCount ?? 0,
      icon: AlertTriangle,
      color: "from-red-500 to-rose-600",
      bgGlow: "bg-red-500/8",
    },
    {
      label: "Sessions (7d)",
      value: stats?.recentSessions ?? 0,
      icon: FileText,
      color: "from-blue-500 to-indigo-600",
      bgGlow: "bg-blue-500/8",
    },
    {
      label: "Crisis Alerts",
      value: stats?.crisisAlerts ?? 0,
      icon: Bell,
      color: "from-amber-500 to-orange-600",
      bgGlow: "bg-amber-500/8",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Stats Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className={`relative overflow-hidden rounded-xl border border-(--border) ${card.bgGlow} p-5`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-(--text-muted) uppercase tracking-wide mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-(--text)">{card.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                <card.icon size={18} className="text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── High Risk Patients ─────────────────────────────────── */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="rounded-xl border border-(--border) bg-(--surface) overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-(--border)">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-400" />
              <h3 className="text-sm font-semibold text-(--text)">High-Risk Patients</h3>
            </div>
            <button
              onClick={() => router.push("/doctor/patients")}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>

          <div className="divide-y divide-(--border)">
            {(!data?.highRiskPatients || data.highRiskPatients.length === 0) ? (
              <div className="px-5 py-8 text-center">
                <Shield size={32} className="mx-auto mb-2 text-emerald-500/40" />
                <p className="text-sm text-(--text-muted)">No high-risk patients right now</p>
                <p className="text-xs text-(--text-muted) mt-1">All patients are in a safe range</p>
              </div>
            ) : (
              data.highRiskPatients.map((patient) => (
                <button
                  key={patient.patientId}
                  onClick={() => router.push(`/doctor/patients/${patient.patientId}`)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-(--surface-raised) transition-colors cursor-pointer text-left"
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    patient.riskLevel === "High" ? "bg-red-500 animate-pulse" : "bg-amber-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-(--text) truncate">
                      Patient {patient.patientId.slice(-6)}
                    </p>
                    <p className="text-xs text-(--text-muted)">
                      {patient.prediction} · {(patient.confidence * 100).toFixed(0)}% confidence
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    patient.riskLevel === "High"
                      ? "bg-red-500/15 text-red-400"
                      : "bg-amber-500/15 text-amber-400"
                  }`}>
                    {patient.riskLevel}
                  </span>
                  <ChevronRight size={14} className="text-(--text-muted)" />
                </button>
              ))
            )}
          </div>
        </motion.div>

        {/* ─── Recent Alerts ──────────────────────────────────────── */}
        <motion.div
          custom={5}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="rounded-xl border border-(--border) bg-(--surface) overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-(--border)">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-amber-400" />
              <h3 className="text-sm font-semibold text-(--text)">Recent Alerts</h3>
            </div>
            <button
              onClick={() => router.push("/doctor/alerts")}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>

          <div className="divide-y divide-(--border)">
            {alerts.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Activity size={32} className="mx-auto mb-2 text-emerald-500/40" />
                <p className="text-sm text-(--text-muted)">No new alerts</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert._id}
                  className={`px-5 py-3 ${
                    alert.priority === "critical"
                      ? "border-l-2 border-red-500 bg-red-500/5"
                      : "border-l-2 border-amber-500/30"
                  }`}
                >
                  <p className="text-sm font-medium text-(--text)">{alert.title}</p>
                  <p className="text-xs text-(--text-muted) mt-0.5 line-clamp-2">{alert.body}</p>
                  <p className="text-[10px] text-(--text-muted) mt-1">
                    {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* ─── Quick Actions ────────────────────────────────────────── */}
      <motion.div
        custom={6}
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          { label: "Add Patient", desc: "Assign a new patient to your care", href: "/doctor/patients", icon: Users, color: "emerald" },
          { label: "New Session Note", desc: "Document a therapy session", href: "/doctor/sessions", icon: FileText, color: "blue" },
          { label: "View Messages", desc: "Check patient messages", href: "/doctor/messages", icon: MessageSquare, color: "purple" },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => router.push(action.href)}
            className="flex items-center gap-4 p-4 rounded-xl border border-(--border) bg-(--surface) hover:bg-(--surface-raised) transition-all group cursor-pointer text-left"
          >
            <div className={`w-10 h-10 rounded-xl bg-${action.color}-500/12 flex items-center justify-center shrink-0`}>
              <action.icon size={18} className={`text-${action.color}-400`} />
            </div>
            <div>
              <p className="text-sm font-medium text-(--text) group-hover:text-emerald-400 transition-colors">{action.label}</p>
              <p className="text-xs text-(--text-muted)">{action.desc}</p>
            </div>
          </button>
        ))}
      </motion.div>
    </div>
  );
}
