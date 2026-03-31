// src/layouts/components/MobileSidebar.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X, Brain, LayoutDashboard, FileText, History, Settings, Users, MapPin, Bell, Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslation } from "@/hooks/useTranslation";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();

  const NAV_ITEMS = [
    { label: t("overview"), href: "/dashboard", icon: LayoutDashboard },
    { label: t("analyze"), href: "/dashboard#analyzer", icon: FileText },
    { label: t("history"), href: "/dashboard#history", icon: History },
    { label: t("counselling"), href: "/counselling", icon: Users },
    { label: t("nearby"), href: "/nearby", icon: MapPin },
    { label: t("moodTracker"), href: "/mood", icon: Smile },
    { label: t("reminders"), href: "/reminders", icon: Bell },
    { label: t("settings"), href: "/settings", icon: Settings },
  ] as const;

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    router.push("/login");
    onClose();
  };

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-64 bg-(--surface) border-r border-(--border) z-50 md:hidden flex flex-col"
          >
            {/* Header with close button */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-(--border)">
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-(--accent) flex items-center justify-center">
                  <Brain size={14} className="text-[#080c10]" />
                </div>
                <span className="font-semibold text-sm text-(--text)">
                  MindTrack<span className="text-(--accent)">AI</span>
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-md hover:bg-(--surface-raised) transition-colors"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5">
              {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                const isActive =
                  pathname === href ||
                  (href !== "/dashboard" && !href.includes("#") && pathname.startsWith(href));

                return (
                  <Link
                    key={label}
                    href={href}
                    onClick={handleLinkClick}
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
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm
                           text-(--text-secondary) hover:text-red-400 hover:bg-red-500/5 transition"
              >
                Log out
              </button>
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
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}