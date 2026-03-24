"use client";

import Header from "./components/Header";
import Footer from "./components/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="scan-line" aria-hidden />
      <Header />
      <main className="flex-1 pt-14">
        <div className="max-w-6xl mx-auto px-4 md:px-8">{children}</div>
      </main>
      <Footer />
    </div>
  );
}