"use client";

import MainLayout from "@/layouts/MainLayout";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

import Hero from "@/features/home/components/Hero";
import Features from "@/features/home/components/Features";
import HowItWorks from "@/features/home/components/HowItWorks";
import CTA from "@/features/home/components/CTA";

export default function HomePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const handleStart = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-10">
        <Hero onStart={handleStart} />
        <Features />
        <HowItWorks />
        <CTA onStart={handleStart} />
      </div>
    </MainLayout>
  );
}