"use client";

import { Download, Bell } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import Button from "@/components/ui/Button";
import { exportToPDF } from "@/utils/exportPDF";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function DashboardHeader({ title, subtitle }: HeaderProps) {
  const user = useAuthStore((s) => s.user);

  // Friendly greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <header
      className="sticky top-0 z-40 h-14 flex items-center justify-between
                 px-6 shrink-0 bg-[var(--bg)] border-b border-[var(--border)]"
      style={{ backdropFilter: "blur(12px)", background: "rgba(8,12,16,0.92)" }}
    >
      {/* Left: breadcrumb / title */}
      <div className="min-w-0">
        <h1 className="text-sm font-semibold text-[var(--text)] truncate tracking-[-0.01em]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-[var(--text-muted)] truncate">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Greeting — hidden on small screens */}
        <span className="hidden lg:block text-xs text-[var(--text-muted)] mr-2">
          {greeting},{" "}
          <span className="text-[var(--text-secondary)]">
            {user?.email.split("@")[0] ?? "there"}
          </span>
        </span>

        {/* Notification bell — decorative for now */}
        <button
          className="size-8 rounded-[var(--radius-md)] flex items-center justify-center
                     text-[var(--text-muted)] hover:text-[var(--text)]
                     hover:bg-[var(--surface)] border border-transparent
                     hover:border-[var(--border)] transition-all"
          aria-label="Notifications"
        >
          <Bell size={14} />
        </button>

        {/* Export */}
        <Button
          size="sm"
          variant="secondary"
          icon={<Download size={13} />}
          onClick={() => exportToPDF("dashboard-content")}
        >
          Export PDF
        </Button>
      </div>
    </header>
  );
}