export default function Footer() {
  return (
    <footer className="border-t border-(--border) mt-24">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-xs text-(--text-muted)">
          © {new Date().getFullYear()} MindTrack AI. All rights reserved.
        </span>
        <span className="text-xs text-(--text-muted)">
          Built for researchers &amp; clinicians.
        </span>
      </div>
    </footer>
  );
}