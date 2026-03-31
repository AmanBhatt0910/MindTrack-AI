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
      <div className="size-10 rounded-full bg-(--surface-raised) border border-(--border)
                      flex items-center justify-center">
        <FileText size={16} className="text-(--text-muted)" />
      </div>
      <p className="text-sm text-(--text-muted)">
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
  const [open, setOpen] = useState(false);

  const badgeVariant = (PREDICTION_VARIANT[item.prediction] ?? "default") as
    "danger" | "warning" | "success" | "default";

  const confidencePct = Math.round(item.confidence * 100);

  return (
    <motion.div layout>
      {/* Clickable header */}
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="group flex items-center gap-4 px-4 py-3 rounded-md
                   border border-(--border) bg-(--surface)
                   hover:border-(--border-active) hover:bg-(--surface-raised)
                   transition-all duration-150 cursor-pointer"
      >
        {/* Icon */}
        <div className="size-8 rounded-sm bg-(--surface-raised)
                        border border-(--border) flex items-center justify-center shrink-0">
          <FileText size={13} className="text-(--text-muted)" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-(--text) line-clamp-1">
            {item.text}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Clock size={10} className="text-(--text-muted)" />
            <span
              className="text-[11px] text-(--text-muted)"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {new Date(item.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 shrink-0">
          <Badge variant={badgeVariant}>{item.prediction}</Badge>
          <span
            className="text-[11px] text-(--text-muted) w-10 text-right tabular-nums"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {confidencePct}%
          </span>
          <ChevronRight
            size={13}
            className={`text-(--text-muted) transition-transform ${
              open ? "rotate-90" : ""
            }`}
          />
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-4"
          >
            <div className="mt-3 rounded-md border border-(--border) bg-(--surface-raised) p-4 space-y-3">
              {/* Full text */}
              <p className="text-sm text-(--text) whitespace-pre-wrap">
                {item.text}
              </p>

              {/* Explanation */}
              {item.explanation?.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-(--text-muted)">Explanation:</p>
                  <ul className="text-xs text-(--text-muted) list-disc pl-4 space-y-1">
                    {item.explanation.map((exp, i) => (
                      <li key={i}>{exp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
          <div className="size-1.5 rounded-full bg-(--accent) pulse-dot" aria-hidden />
          <h2 className="text-sm font-semibold text-(--text) tracking-[-0.01em]">
            Recent analyses
          </h2>
        </div>
        <span
          className="text-xs text-(--text-muted) tabular-nums"
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