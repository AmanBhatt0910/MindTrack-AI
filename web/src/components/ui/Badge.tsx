import clsx from "clsx";

export default function Badge({
  children,
  variant = "default",
}: {
  children: string;
  variant?: "default" | "success" | "danger";
}) {
  const styles = {
    default: "bg-slate-700 text-white",
    success: "bg-green-500/20 text-green-400",
    danger: "bg-red-500/20 text-red-400",
  };

  return (
    <span
      className="px-2 py-1 rounded-md text-xs"
      style={{
        backgroundColor: "var(--border)",
        color: "var(--text)",
      }}
    >
      {children}
    </span>
  );
}