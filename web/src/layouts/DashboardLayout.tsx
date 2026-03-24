import Sidebar from "@/components/shared/Sidebar";
import Header from "./components/DashboardHeader";
import Footer from "./components/DashboardFooter";

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
  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header title={title} subtitle={subtitle} />

        <main
          id="dashboard-content"
          className="flex-1 px-6 py-6 overflow-y-auto"
        >
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
}