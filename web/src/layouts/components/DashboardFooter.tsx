export default function DashboardFooter() {
  return (
    <footer className="px-6 py-4 border-t border-[var(--border)] shrink-0">
      <p className="text-xs text-[var(--text-muted)]">
        © {new Date().getFullYear()} MindTrack AI — Built for researchers &amp; clinicians.
      </p>
    </footer>
  );
}