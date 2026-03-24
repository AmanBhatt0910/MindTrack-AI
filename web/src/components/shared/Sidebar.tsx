"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain } from "lucide-react";
import { clsx } from "clsx";
import { SIDEBAR_NAV, SIDEBAR_BOTTOM } from "@/constants/dashboard";
import { useAuthStore } from "@/store/useAuthStore";

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  return (
    <aside
      className="hidden md:flex flex-col w-56 shrink-0 min-h-screen
                 bg-[var(--surface)] border-r border-[var(--border)]"
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-[var(--border)] shrink-0">
        <div
          className="size-7 rounded-lg bg-[var(--accent)] flex items-center justify-center shrink-0"
          style={{ boxShadow: "0 0 14px var(--accent-glow)" }}
        >
          <Brain size={14} className="text-[#080c10]" />
        </div>
        <span className="font-semibold text-sm tracking-[-0.02em] text-[var(--text)]">
          MindTrack<span className="text-[var(--accent)]">AI</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p
          className="px-2 pb-2 text-[10px] uppercase tracking-widest text-[var(--text-muted)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Menu
        </p>

        {SIDEBAR_NAV.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={label}
              href={href}
              className={clsx(
                "flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] text-sm",
                "transition-all duration-150 group",
                isActive
                  ? "bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--border-active)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)]"
              )}
            >
              <Icon
                size={15}
                className={clsx(
                  "shrink-0 transition-colors",
                  isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]"
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-0.5 border-t border-[var(--border)] pt-3">
        {SIDEBAR_BOTTOM.map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] text-sm
                       text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/5
                       transition-all duration-150 group"
          >
            <Icon size={15} className="shrink-0 text-[var(--text-muted)] group-hover:text-red-400 transition-colors" />
            {label}
          </Link>
        ))}

        {/* User avatar */}
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-2 mt-1">
            <div
              className="size-7 rounded-full bg-[var(--accent)] flex items-center justify-center
                         text-[#080c10] text-[10px] font-bold shrink-0"
            >
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[var(--text)] truncate">
                {user.email}
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">Free plan</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}