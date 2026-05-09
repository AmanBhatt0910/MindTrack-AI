import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ThemeProvider from "@/components/shared/ThemeProvider";
import ClientProviders from "@/components/shared/ClientProviders";
import ServiceWorkerRegister from "@/components/shared/ServiceWorkerRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MindTrack AI",
  description: "AI-powered mental health detection",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <ThemeProvider>
          <ServiceWorkerRegister />
          <ClientProviders>
            {children}
          </ClientProviders>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}