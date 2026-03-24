"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import MainLayout from "@/layouts/MainLayout";
import Hero from "@/features/home/components/Hero";
import Features from "@/features/home/components/Features";
import HowItWorks from "@/features/home/components/HowItWorks";
import CTA from "@/features/home/components/CTA";

export default function HomePage() {
  const router = useRouter();
  const user   = useAuthStore((s) => s.user);

  const handleStart = () => {
    router.push(user ? "/dashboard" : "/login");
  };

  return (
    <MainLayout>
      <Hero onStart={handleStart} />
      <Features />
      <HowItWorks />
      <CTA onStart={handleStart} />
    </MainLayout>
  );
}