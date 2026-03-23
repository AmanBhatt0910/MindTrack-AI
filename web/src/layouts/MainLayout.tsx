export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen px-4 md:px-8">
      <header className="flex justify-between items-center py-4">
        <h1 className="font-bold text-lg text-indigo-400">
          MindTrack AI
        </h1>
      </header>

      <main className="max-w-6xl mx-auto">{children}</main>
    </div>
  );
}