"use client";

export default function GridBackground() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden
    >
      <div className="absolute inset-0 bg-grid opacity-100" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                   w-200 h-150 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(6,182,212,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(6,182,212,0.05) 0%, transparent 70%)",
        }}
      />
      {[38, 54, 70].map((pct) => (
        <div
          key={pct}
          className="absolute inset-x-0 h-px"
          style={{
            top: `${pct}%`,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 30%, rgba(6,182,212,0.08) 50%, rgba(255,255,255,0.04) 70%, transparent 100%)",
          }}
        />
      ))}
    </div>
  );
}