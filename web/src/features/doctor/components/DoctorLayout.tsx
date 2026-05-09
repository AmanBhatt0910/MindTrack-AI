"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  FileText,
  MessageSquare,
  Bell,
  LogOut,
  Menu,
  X,
  Stethoscope,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/doctor", label: "Dashboard", icon: LayoutDashboard },
  { href: "/doctor/patients", label: "Patients", icon: Users },
  { href: "/doctor/alerts", label: "Alerts", icon: AlertTriangle },
  { href: "/doctor/sessions", label: "Sessions", icon: FileText },
  { href: "/doctor/messages", label: "Messages", icon: MessageSquare },
];

interface DoctorLayoutProps {
  children: React.ReactNode;
}

export default function DoctorLayout({ children }: DoctorLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, hasHydrated, isDoctor } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  // Guard: redirect non-doctors
  useEffect(() => {
    if (hasHydrated && (!user || !isDoctor())) {
      router.replace("/login");
    }
  }, [hasHydrated, user, isDoctor, router]);

  // Fetch notification count
  useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/doctor/notifications?limit=1", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.ok) {
          const data = await res.json();
          setNotifCount(data.unreadCount || 0);
        }
      } catch { /* silent */ }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (!hasHydrated || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-(--bg)">
        <div className="shimmer w-12 h-12 rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-(--bg)">
      {/* ─── Desktop Sidebar ─────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-(--border) bg-(--bg-secondary)">
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-(--border)">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Stethoscope size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-(--text)">MindTrack</h1>
            <p className="text-[10px] text-(--text-muted) tracking-wide uppercase">Clinician Portal</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/doctor" && pathname.startsWith(item.href));
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                  active
                    ? "bg-emerald-500/12 text-emerald-400 font-medium"
                    : "text-(--text-secondary) hover:bg-(--surface) hover:text-(--text)"
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
                {item.label === "Alerts" && notifCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {notifCount > 99 ? "99+" : notifCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-(--border) p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-(--text) truncate">{user.name}</p>
              <p className="text-[10px] text-(--text-muted) truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-(--text-muted) hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── Mobile Sidebar Overlay ──────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-(--bg-secondary) border-r border-(--border) z-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-(--border)">
                <div className="flex items-center gap-2">
                  <Stethoscope size={18} className="text-emerald-400" />
                  <span className="text-sm font-semibold text-(--text)">Clinician Portal</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-(--text-muted) cursor-pointer">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 py-4 px-3 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <button
                      key={item.href}
                      onClick={() => { router.push(item.href); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                        active
                          ? "bg-emerald-500/12 text-emerald-400 font-medium"
                          : "text-(--text-secondary) hover:bg-(--surface)"
                      }`}
                    >
                      <item.icon size={18} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─── Main Content ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-(--border) bg-(--bg-secondary)/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-(--text-muted) hover:text-(--text) cursor-pointer"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-(--text)">
                {NAV_ITEMS.find((i) => pathname === i.href || (i.href !== "/doctor" && pathname.startsWith(i.href)))?.label || "Dashboard"}
              </h2>
              <p className="text-xs text-(--text-muted)">
                Welcome back, Dr. {user.name?.split(" ")[0]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/doctor/alerts")}
              className="relative p-2 rounded-lg hover:bg-(--surface) transition-colors cursor-pointer"
            >
              <Bell size={20} className="text-(--text-secondary)" />
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
