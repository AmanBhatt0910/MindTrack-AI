"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import Button from "@/components/ui/Button";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
] as const;

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={clsx(
        "fixed top-0 inset-x-0 z-50",
        "glass border-b border-(--border)",
        "px-4 md:px-8"
      )}
    >
      <div className="max-w-6xl mx-auto h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
          aria-label="MindTrack AI Home"
        >
          <div
            className="relative size-7 rounded-lg bg-(--accent) flex items-center justify-center"
            style={{ boxShadow: "0 0 16px var(--accent-glow)" }}
          >
            <Brain size={14} className="text-[#080c10]" />
          </div>
          <span
            className="font-semibold text-sm tracking-[-0.02em] text-(--text)
                       group-hover:text-(--accent) transition-colors"
          >
            MindTrack
            <span className="text-(--accent) ml-0.5">AI</span>
          </span>
        </Link>

        {/* Nav — home only */}
        {isHome && (
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3 py-1.5 rounded-md text-sm text-(--text-secondary)
                           hover:text-(--text) hover:bg-(--surface)
                           transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        {/* CTA */}
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" icon={<ArrowRight size={12} />} iconPosition="right">
              Get started
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}