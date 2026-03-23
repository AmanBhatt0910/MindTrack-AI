"use client";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function PostInput({ value, onChange }: Props) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Paste social media post here..."
      className="w-full h-40 p-4 rounded-xl resize-none outline-none"
      style={{
        backgroundColor: "var(--card)",
        color: "var(--text)",
        border: "1px solid var(--border)",
      }}
    />
  );
}