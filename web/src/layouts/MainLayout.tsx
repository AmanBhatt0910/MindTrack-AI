import { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen px-4 md:px-8">
      <main className="max-w-7xl mx-auto">{children}</main>
    </div>
  );
}