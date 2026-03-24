"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Brain } from "lucide-react";
import { clsx } from "clsx";
import { SIDEBAR_NAV } from "@/constants/dashboard";
import { useAuthStore } from "@/store/useAuthStore";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 h-full bg-(--surface) border-r border-(--border)">
      
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-(--border)">
        <div className="size-7 rounded-lg bg-(--accent) flex items-center justify-center">
          <Brain size={14} className="text-[#080c10]" />
        </div>
        <span className="font-semibold text-sm text-(--text)">
          MindTrack<span className="text-(--accent)">AI</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {SIDEBAR_NAV.map(({ label, href, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));

          return (
            <Link
              key={label}
              href={href}
              className={clsx(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm",
                isActive
                  ? "bg-(--accent-dim) text-(--accent)"
                  : "text-(--text-secondary) hover:bg-(--surface-raised)"
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-(--border) pt-3 space-y-2">
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm
                     text-(--text-secondary) hover:text-red-400 hover:bg-red-500/5 transition"
        >
          Log out
        </button>

        {/* User */}
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="size-7 rounded-full bg-(--accent) flex items-center justify-center text-[#080c10] text-[10px] font-bold">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-(--text) truncate">
                {user.email}
              </p>
              <p className="text-[10px] text-(--text-muted)">Free plan</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}