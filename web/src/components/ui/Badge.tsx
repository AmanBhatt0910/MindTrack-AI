import { HTMLAttributes } from "react";
import { clsx } from "clsx";

type BadgeVariant = "default" | "accent" | "success" | "warning" | "danger";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[var(--surface-raised)] text-[var(--text-secondary)] border-[var(--border)]",
  accent:  "bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--border-active)]",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  danger:  "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-full",
        "text-[11px] font-medium tracking-wide border",
        variantStyles[variant],
        className
      )}
      style={{ fontFamily: "var(--font-mono)" }}
      {...props}
    >
      {children}
    </span>
  );
}