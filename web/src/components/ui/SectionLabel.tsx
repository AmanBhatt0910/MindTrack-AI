"use client";

import { ReactNode } from "react";

interface SectionLabelProps {
  children: ReactNode;
}

export default function SectionLabel({ children }: SectionLabelProps) {
  return (
    <span
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                 bg-(--surface) border border-(--border)
                 text-[11px] font-medium tracking-widest uppercase text-(--text-secondary)"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </span>
  );
}