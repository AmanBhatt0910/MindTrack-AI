"use client";

import {
  forwardRef,
  InputHTMLAttributes,
  useState,
  useId,
  ReactNode,
} from "react";
import { clsx } from "clsx";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  /** If true and type="password", renders the show/hide toggle */
  showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      iconLeft,
      iconRight,
      showPasswordToggle = false,
      className,
      type,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const [revealed, setRevealed] = useState(false);

    const isPassword = type === "password";
    const resolvedType = isPassword && revealed ? "text" : type;
    const hasRightSlot = showPasswordToggle && isPassword || iconRight;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={clsx(
              "text-xs font-medium tracking-wide uppercase",
              error
                ? "text-red-400"
                : "text-[var(--text-secondary)]"
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative flex items-center">
          {/* Left icon */}
          {iconLeft && (
            <span
              className="absolute left-3 size-4 text-[var(--text-muted)] pointer-events-none flex items-center"
              aria-hidden
            >
              {iconLeft}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            disabled={disabled}
            className={clsx(
              "w-full h-11 rounded-[var(--radius-md)] text-sm",
              "bg-[var(--surface)] text-[var(--text)]",
              "border transition-all duration-200 outline-none",
              "placeholder:text-[var(--text-muted)]",
              // padding — adjust for icons
              iconLeft  ? "pl-10" : "pl-4",
              hasRightSlot ? "pr-10" : "pr-4",
              // border state
              error
                ? "border-red-500/60 focus:border-red-400 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
                : "border-[var(--border)] focus:border-[var(--border-active)] focus:shadow-[0_0_0_3px_var(--accent-glow)]",
              disabled && "opacity-40 cursor-not-allowed",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />

          {/* Right slot — password toggle takes priority over iconRight */}
          {showPasswordToggle && isPassword ? (
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              className="absolute right-3 size-4 text-[var(--text-muted)] hover:text-[var(--text)]
                         transition-colors flex items-center justify-center"
              aria-label={revealed ? "Hide password" : "Show password"}
            >
              {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          ) : iconRight ? (
            <span
              className="absolute right-3 size-4 text-[var(--text-muted)] pointer-events-none flex items-center"
              aria-hidden
            >
              {iconRight}
            </span>
          ) : null}
        </div>

        {/* Error message */}
        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="flex items-center gap-1.5 text-xs text-red-400"
          >
            <AlertCircle size={11} className="shrink-0" />
            {error}
          </p>
        )}

        {/* Hint */}
        {!error && hint && (
          <p
            id={`${inputId}-hint`}
            className="text-xs text-[var(--text-muted)]"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;