"use client";

import { Brain, BarChart, History, LogOut } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import clsx from "clsx";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { setUser } = useAuthStore();

  const handleLogout = () => {
    setUser(null);
    router.push("/login");
  };

  const handleNavigate = (sectionId?: string) => {
    if (pathname !== "/dashboard") {
      router.push("/dashboard");

      setTimeout(() => {
        if (sectionId) {
          document
            .getElementById(sectionId)
            ?.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      if (sectionId) {
        document
          .getElementById(sectionId)
          ?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const navItems = [
    {
      label: "Dashboard",
      icon: BarChart,
      onClick: () => handleNavigate(),
      active: pathname === "/dashboard",
    },
    {
      label: "History",
      icon: History,
      onClick: () => handleNavigate("history"),
      active: false, // can enhance later with scroll tracking
    },
  ];

  return (
    <aside
      className="w-64 p-4 hidden md:flex flex-col justify-between border-r"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      <div>
        {/* Logo */}
        <div
          className="flex items-center gap-2 mb-6 cursor-pointer"
          onClick={() => router.push("/dashboard")}
          style={{ color: "var(--text)" }}
        >
          <Brain className="text-indigo-400" />
          <span className="font-bold text-lg">MindTrack</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <button
                key={index}
                onClick={item.onClick}
                className={clsx(
                  "flex items-center gap-2 w-full p-2 rounded-lg transition"
                )}
                style={{
                  backgroundColor: item.active
                    ? "rgba(99, 102, 241, 0.15)"
                    : "transparent",
                  color: item.active
                    ? "#6366f1"
                    : "var(--muted)",
                }}
                onMouseEnter={(e) => {
                  if (!item.active) {
                    e.currentTarget.style.backgroundColor =
                      "var(--border)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!item.active) {
                    e.currentTarget.style.backgroundColor =
                      "transparent";
                  }
                }}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-3">
        <ThemeToggle />

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 p-2 rounded-lg w-full transition"
          style={{ color: "#ef4444" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              "rgba(239, 68, 68, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}