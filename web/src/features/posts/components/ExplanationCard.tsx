import { Lightbulb } from "lucide-react";

export default function ExplanationCard({ text }: { text: string }) {
  return (
    <div
      className="flex items-start gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5
                 bg-[var(--surface-raised)] border border-[var(--border)]"
    >
      <Lightbulb
        size={13}
        className="text-[var(--accent)] shrink-0 mt-0.5"
      />
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        {text}
      </p>
    </div>
  );
}