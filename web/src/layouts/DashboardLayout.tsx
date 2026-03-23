import { Brain, BarChart, History } from "lucide-react";
import ThemeToggle from "@/components/shared/ThemeToggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-slate-800 p-4 hidden md:flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 mb-6">
            <Brain />
            <span className="font-bold">MindTrack</span>
          </div>

          <nav className="space-y-3">
            <p className="flex items-center gap-2 text-slate-300">
              <BarChart size={16} /> Dashboard
            </p>
            <p className="flex items-center gap-2 text-slate-400">
              <History size={16} /> History
            </p>
          </nav>
        </div>

        <ThemeToggle />
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}