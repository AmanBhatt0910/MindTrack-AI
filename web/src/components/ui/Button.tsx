"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size    = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-[#080c10] font-semibold hover:brightness-110 shadow-[0_0_20px_var(--accent-glow)]",
  secondary:
    "bg-[var(--surface-raised)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--border-active)] hover:bg-[var(--surface)]",
  ghost:
    "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface)]",
  danger:
    "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-5 text-sm gap-2",
  lg: "h-12 px-8 text-base gap-2.5",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={clsx(
          // base
          "relative inline-flex items-center justify-center rounded-md",
          "font-medium tracking-[-0.01em] transition-all duration-200",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "select-none cursor-pointer",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className="animate-spin size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </span>
        )}
        <span
          className={clsx(
            "flex items-center gap-[inherit]",
            loading && "opacity-0"
          )}
        >
          {icon && iconPosition === "left" && (
            <span className="shrink-0 size-4">{icon}</span>
          )}
          {children}
          {icon && iconPosition === "right" && (
            <span className="shrink-0 size-4">{icon}</span>
          )}
        </span>
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;