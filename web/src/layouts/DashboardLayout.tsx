import { ReactNode } from "react";
import { Brain } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 p-4 hidden md:block">
        <div className="flex items-center gap-2 text-indigo-400 mb-6">
          <Brain />
          <span className="font-bold">MindTrack</span>
        </div>

        <nav className="space-y-2">
          <p className="text-slate-400">Dashboard</p>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}