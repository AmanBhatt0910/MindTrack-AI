"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { AlertTriangle, Bell, CheckCircle, ChevronRight, Shield } from "lucide-react";
import { doctorService } from "@/features/doctor/services/doctor.service";
import type { AlertItem } from "@/features/doctor/types/doctor.types";
import { toast } from "sonner";

export default function AlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await doctorService.getAlerts();
      setAlerts(data.alerts);
    } catch (err) {
      console.error("Failed to load alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await doctorService.acknowledgeAlert(id);
      setAlerts((prev) => prev.map((a) => (a._id === id ? { ...a, read: true } : a)));
      toast.success("Alert acknowledged");
    } catch (err) {
      toast.error("Failed to acknowledge alert");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="shimmer h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {alerts.length === 0 ? (
        <div className="text-center py-20">
          <Shield size={48} className="mx-auto mb-3 text-emerald-500/30" />
          <p className="text-sm text-(--text-muted)">No alerts at this time</p>
          <p className="text-xs text-(--text-muted) mt-1">All patients are in a safe range</p>
        </div>
      ) : (
        alerts.map((alert, i) => (
          <motion.div
            key={alert._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`rounded-xl border p-5 transition-all ${
              alert.priority === "critical" && !alert.read
                ? "border-red-500/40 bg-red-500/5"
                : alert.read
                ? "border-(--border) bg-(--surface) opacity-60"
                : "border-amber-500/30 bg-(--surface)"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                alert.priority === "critical"
                  ? "bg-red-500/15"
                  : "bg-amber-500/15"
              }`}>
                {alert.priority === "critical" ? (
                  <AlertTriangle size={18} className="text-red-400" />
                ) : (
                  <Bell size={18} className="text-amber-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-(--text)">{alert.title}</h3>
                  {alert.read && (
                    <CheckCircle size={14} className="text-emerald-500/50" />
                  )}
                </div>
                <p className="text-sm text-(--text-secondary) mb-2">{alert.body}</p>
                <p className="text-[10px] text-(--text-muted)">
                  {new Date(alert.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!alert.read && (
                  <button
                    onClick={() => handleAcknowledge(alert._id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/12 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors cursor-pointer"
                  >
                    Acknowledge
                  </button>
                )}
                {typeof alert.metadata?.patientId === "string" && (
                  <button
                    onClick={() => router.push(`/doctor/patients/${alert.metadata.patientId as string}`)}
                    className="p-1.5 rounded-lg hover:bg-(--surface-raised) transition-colors cursor-pointer"
                  >
                    <ChevronRight size={16} className="text-(--text-muted)" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}
