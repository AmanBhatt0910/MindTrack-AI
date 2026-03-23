import { InputHTMLAttributes } from "react";
import clsx from "clsx";

export default function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full p-3 rounded-lg outline-none ${className}`}
      style={{
        backgroundColor: "var(--card)",
        color: "var(--text)",
        border: "1px solid var(--border)",
      }}
      {...props}
    />
  );
}