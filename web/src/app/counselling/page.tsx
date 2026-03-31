"use client";

import { useState } from "react";
import { Search, Users } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import DashboardLayout from "@/layouts/DashboardLayout";
import CounsellorCard from "@/features/counselling/components/CounsellorCard";
import { COUNSELLORS } from "@/constants/counsellors";
import { useTranslation } from "@/hooks/useTranslation";

export default function CounsellingPage() {
  const user = useRequireAuth();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [filterAvailable, setFilterAvailable] = useState(false);

  if (!user) return null;

  const filtered = COUNSELLORS.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.specialty.some((s) => s.toLowerCase().includes(q)) ||
      c.language.some((l) => l.toLowerCase().includes(q));
    const matchAvail = !filterAvailable || c.available;
    return matchSearch && matchAvail;
  });

  return (
    <DashboardLayout
      title={t("counsellingTitle")}
      subtitle={t("counsellingSubtitle")}
    >
      <div className="space-y-6 max-w-6xl">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
            />
            <input
              type="text"
              placeholder={`${t("search")} counsellors…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-[var(--radius-md)] text-sm
                         bg-[var(--surface)] text-[var(--text)]
                         border border-[var(--border)] placeholder:text-[var(--text-muted)]
                         focus:border-[var(--border-active)] focus:outline-none
                         focus:shadow-[0_0_0_3px_var(--accent-glow)]
                         transition-all duration-200"
            />
          </div>

          {/* Available filter */}
          <button
            onClick={() => setFilterAvailable((v) => !v)}
            className={`flex items-center gap-2 px-4 h-10 rounded-[var(--radius-md)] text-sm
                        border transition-all duration-200 font-medium shrink-0
                        ${
                          filterAvailable
                            ? "bg-green-500/10 text-green-400 border-green-500/25"
                            : "bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-active)]"
                        }`}
          >
            <span
              className={`size-1.5 rounded-full ${filterAvailable ? "bg-green-400" : "bg-[var(--text-muted)]"}`}
            />
            {t("available")} only
          </button>
        </div>

        {/* Results count */}
        <div className="flex items-center gap-2">
          <Users size={14} className="text-[var(--text-muted)]" />
          <p className="text-xs text-[var(--text-muted)]">
            {filtered.length} counsellor{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((counsellor) => (
              <CounsellorCard key={counsellor.id} counsellor={counsellor} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="size-12 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
              <Users size={18} className="text-[var(--text-muted)]" />
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              No counsellors found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
