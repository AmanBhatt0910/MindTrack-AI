// src/layouts/DashboardLayout.tsx
"use client";

import { useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import DashboardHeader from "./components/DashboardHeader";
import DashboardFooter from "./components/DashboardFooter";
import DashboardMobileSidebar from "./components/MobileSidebar";
import MoodPromptModal from "@/features/mood/components/MoodPromptModal";
import PwaInstallBanner from "@/components/ui/PwaInstallBanner";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function DashboardLayout({
  children,
  title = "Dashboard",
  subtitle,
}: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuClick = () => {
    setIsMobileMenuOpen(true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-(--bg)">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar (drawer) */}
      <DashboardMobileSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <PwaInstallBanner />
        <DashboardHeader title={title} subtitle={subtitle} onMenuClick={handleMenuClick} />

        <main
          id="dashboard-content"
          className="flex-1 overflow-y-auto px-6 py-6"
        >
          {children}
        </main>

        <DashboardFooter />
        <MoodPromptModal />
      </div>
    </div>
  );
}