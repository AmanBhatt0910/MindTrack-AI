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
      className="p-3 rounded-lg bg-slate-800 w-full"
    >
      <option value="en">English</option>
      <option value="hi">Hindi</option>
      <option value="es">Spanish</option>
    </select>
  );
}