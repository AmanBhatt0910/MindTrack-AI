import { ReactNode } from "react";
import clsx from "clsx";

export default function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl p-5 shadow-sm border ${className}`}
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      {children}
    </div>
  );
}