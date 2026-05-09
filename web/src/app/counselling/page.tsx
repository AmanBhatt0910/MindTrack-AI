"use client";

import { useState, useEffect } from "react";
import { Search, Users, Shield, Loader2, CheckCircle2, Clock } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useTranslation } from "@/hooks/useTranslation";
import Button from "@/components/ui/Button";

interface Doctor {
  id: string;
  name: string;
  email: string;
  connectionStatus: string | null;
}

export default function CounsellingPage() {
  const user = useRequireAuth(["patient"]);
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/doctors", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDoctors(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleConnect = async (doctorId: string) => {
    try {
      setConnectingId(doctorId);
      const res = await fetch("/api/doctors/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ doctorId })
      });
      const data = await res.json();
      if (data.success) {
        setDoctors(prev => prev.map(d => 
          d.id === doctorId ? { ...d, connectionStatus: "pending" } : d
        ));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConnectingId(null);
    }
  };

  if (!user) return null;

  const filtered = doctors.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  return (
    <DashboardLayout
      title="Registered Doctors"
      subtitle="Connect with certified doctors on the platform."
    >
      <div className="space-y-6 max-w-6xl">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
            />
            <input
              type="text"
              placeholder={`${t("search")} doctors...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-[var(--radius-md)] text-sm
                         bg-[var(--surface)] text-[var(--text)]
                         border border-[var(--border)] placeholder:text-[var(--text-muted)]
                         focus:border-[var(--border-active)] focus:outline-none"
            />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--text-muted)]" /></div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((doctor) => (
              <div key={doctor.id} className="flex flex-col gap-4 p-5 rounded-[var(--radius-lg)] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-active)] transition-all">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold shrink-0">
                    {doctor.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-[var(--text)]">{doctor.name}</h3>
                    <p className="text-xs text-[var(--text-muted)]">{doctor.email}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Shield size={12} className="text-emerald-400" />
                      <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wide">Registered Doctor</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border)] mt-auto">
                  {doctor.connectionStatus === "active" ? (
                    <div className="flex items-center justify-center gap-2 py-2 text-sm text-emerald-400 bg-emerald-500/10 rounded-lg">
                      <CheckCircle2 size={16} /> Connected
                    </div>
                  ) : doctor.connectionStatus === "pending" ? (
                    <div className="flex items-center justify-center gap-2 py-2 text-sm text-amber-400 bg-amber-500/10 rounded-lg">
                      <Clock size={16} /> Request Pending
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      disabled={connectingId === doctor.id}
                      onClick={() => handleConnect(doctor.id)}
                    >
                      {connectingId === doctor.id ? <Loader2 size={16} className="animate-spin" /> : "Connect"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <Users size={24} className="text-[var(--text-muted)]" />
            <p className="text-sm text-[var(--text-muted)]">No doctors found.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
