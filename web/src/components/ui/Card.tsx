import { forwardRef, HTMLAttributes } from "react";
import { clsx } from "clsx";

type CardVariant = "default" | "raised" | "glass" | "accent";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
}

const variantStyles: Record<CardVariant, string> = {
  default:
    "bg-[var(--surface)] border border-[var(--border)]",
  raised:
    "bg-[var(--surface-raised)] border border-[var(--border)] shadow-[var(--shadow-md)]",
  glass:
    "glass",
  accent:
    "bg-[var(--accent-dim)] border border-[var(--border-active)]",
};

const paddingStyles = {
  none: "",
  sm:   "p-4",
  md:   "p-6",
  lg:   "p-8",
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { variant = "default", padding = "md", className, children, ...props },
    ref
  ) => (
    <div
      ref={ref}
      className={clsx(
        "rounded-lg transition-colors duration-200",
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

Card.displayName = "Card";
export default Card;