"use client";

interface TerminalLine {
  label: string;
  value: string;
  color: string;
}

interface TerminalPreviewProps {
  lines?: TerminalLine[];
  title?: string;
}

const DEFAULT_LINES: TerminalLine[] = [
  { label: "post", value: '"Feeling disconnected lately..."', color: "#10b981" },
  { label: "language", value: '"en"', color: "#f59e0b" },
  { label: "label", value: '"depression"', color: "#ef4444" },
  { label: "confidence", value: "0.91", color: "var(--accent)" },
  { label: "severity", value: '"moderate"', color: "#f59e0b" },
];

export default function TerminalPreview({ lines = DEFAULT_LINES, title = "analysis-result.json" }: TerminalPreviewProps) {
  return (
    <div
      className="rounded-lg border border-(--border)
                 bg-(--bg-secondary) overflow-hidden shadow-(--shadow-md)"
    >
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-(--border)">
        {(["#ef4444", "#f59e0b", "#10b981"] as const).map((c) => (
          <span
            key={c}
            className="size-2.5 rounded-full"
            style={{ background: c }}
          />
        ))}
        <span
          className="ml-2 text-[11px] text-(--text-muted)"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {title}
        </span>
      </div>

      <div
        className="p-5 text-sm space-y-1"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <span className="text-(--text-muted)">{"{"}</span>
        {lines.map(({ label, value, color }) => (
          <div key={label} className="pl-4">
            <span className="text-(--text-secondary)">
              {"\""}{label}{"\""}
            </span>
            <span className="text-(--text-muted)">: </span>
            <span style={{ color }}>{value}</span>
            <span className="text-(--text-muted)">,</span>
          </div>
        ))}
        <span className="text-(--text-muted)]">{"}"}</span>
      </div>
    </div>
  );
}