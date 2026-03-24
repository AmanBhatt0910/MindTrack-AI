"use client";

import { useState } from "react";
import { Search, Clock, ChevronRight, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HistoryItem } from "../types/history.types";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import { PREDICTION_VARIANT } from "@/constants/dashboard";

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyHistory({ hasQuery }: { hasQuery: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="size-10 rounded-full bg-[var(--surface-raised)] border border-[var(--border)]
                      flex items-center justify-center">
        <FileText size={16} className="text-[var(--text-muted)]" />
      </div>
      <p className="text-sm text-[var(--text-muted)]">
        {hasQuery ? "No results match your search." : "No analyses yet. Run your first post analysis above."}
      </p>
    </div>
  );
}

// ─── History row ──────────────────────────────────────────────────────────────
interface HistoryRowProps {
  item: HistoryItem;
}

function HistoryRow({ item }: HistoryRowProps) {
  const badgeVariant = (PREDICTION_VARIANT[item.prediction] ?? "default") as
    "danger" | "warning" | "success" | "default";
  const confidencePct = Math.round(item.confidence * 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.25 }}
      className="group flex items-center gap-4 px-4 py-3 rounded-[var(--radius-md)]
                 border border-[var(--border)] bg-[var(--surface)]
                 hover:border-[var(--border-active)] hover:bg-[var(--surface-raised)]
                 transition-all duration-150 cursor-pointer"
    >
      {/* Icon */}
      <div className="size-8 rounded-[var(--radius-sm)] bg-[var(--surface-raised)]
                      border border-[var(--border)] flex items-center justify-center shrink-0">
        <FileText size={13} className="text-[var(--text-muted)]" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--text)] line-clamp-1">{item.text}</p>
        <div className="flex items-center gap-2 mt-1">
          <Clock size={10} className="text-[var(--text-muted)] shrink-0" />
          <span className="text-[11px] text-[var(--text-muted)]"
                style={{ fontFamily: "var(--font-mono)" }}>
            {new Date(item.createdAt).toLocaleDateString("en-US", {
              month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* Right: badge + confidence + chevron */}
      <div className="flex items-center gap-3 shrink-0">
        <Badge variant={badgeVariant}>{item.prediction}</Badge>
        <span
          className="text-[11px] text-[var(--text-muted)] w-10 text-right tabular-nums"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {confidencePct}%
        </span>
        <ChevronRight
          size={13}
          className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function HistoryList({ data }: { data: HistoryItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = data.filter(
    (item) =>
      item.text.toLowerCase().includes(query.toLowerCase()) ||
      item.prediction.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section id="history" className="space-y-4 scroll-mt-20">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-1.5 rounded-full bg-[var(--accent)] pulse-dot" aria-hidden />
          <h2 className="text-sm font-semibold text-[var(--text)] tracking-[-0.01em]">
            Recent analyses
          </h2>
        </div>
        <span
          className="text-xs text-[var(--text-muted)] tabular-nums"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {data.length} total
        </span>
      </div>

      {/* Search */}
      <Input
        placeholder="Search by text or prediction…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        iconLeft={<Search size={13} />}
      />

      {/* List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <EmptyHistory hasQuery={query.length > 0} key="empty" />
          ) : (
            filtered.map((item) => <HistoryRow key={item.id} item={item} />)
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}