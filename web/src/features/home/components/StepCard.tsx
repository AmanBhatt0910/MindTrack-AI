"use client";

interface StepCardProps {
  step: string;
  title: string;
  description: string;
  index: number;
  total: number;
}

export default function StepCard({ step, title, description, index, total }: StepCardProps) {
  return (
    <div className="relative flex flex-col items-center text-center gap-5 flex-1">
      {index < total - 1 && (
        <div
          className="hidden md:block absolute top-6 h-px border-t border-dashed border-(--border)"
          style={{ left: "calc(50% + 2rem)", right: "calc(-50% + 2rem)" }}
          aria-hidden
        />
      )}

      <div
        className="relative z-10 size-12 rounded-full flex items-center justify-center
                   bg-(--surface) border border-(--border-active)
                   shadow-[0_0_20px_var(--accent-glow)]"
      >
        <span
          className="text-sm font-bold text-(--accent)"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {step}
        </span>
      </div>

      <div className="space-y-2 px-2">
        <h3 className="font-semibold text-(--text) tracking-[-0.01em]">
          {title}
        </h3>
        <p className="text-sm text-(--text-secondary) leading-relaxed max-w-[18rem]">
          {description}
        </p>
      </div>
    </div>
  );
}