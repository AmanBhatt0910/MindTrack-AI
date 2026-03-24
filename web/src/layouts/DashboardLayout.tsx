import Sidebar from "@/components/shared/Sidebar";
import DashboardHeader from "./components/DashboardHeader";
import DashboardFooter from "./components/DashboardFooter";

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
    /*
     * h-screen + overflow-hidden on the root locks the total height to the
     * viewport. The sidebar gets h-full so it fills exactly that height.
     * Only the main column scrolls via overflow-y-auto.
     */
    <div className="flex h-screen overflow-hidden bg-(--bg)">
      {/* Sidebar — full viewport height, never scrolls */}
      <Sidebar />

      {/* Main column — flex column, fills remaining width, scrolls independently */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <DashboardHeader title={title} subtitle={subtitle} />

        <main
          id="dashboard-content"
          className="flex-1 overflow-y-auto px-6 py-6"
        >
          {children}
        </main>

        <DashboardFooter />
      </div>
    </div>
  );
}