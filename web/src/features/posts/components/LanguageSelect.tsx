"use client";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function LanguageSelect({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="p-3 rounded-lg w-full outline-none"
      style={{
        backgroundColor: "var(--card)",
        color: "var(--text)",
        border: "1px solid var(--border)",
      }}
    >
      <option value="en">English</option>
      <option value="hi">Hindi</option>
      <option value="es">Spanish</option>
    </select>
  );
}