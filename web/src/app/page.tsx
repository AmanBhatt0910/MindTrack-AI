"use client";

import MainLayout from "@/layouts/MainLayout";
import Button from "@/components/ui/Button";
import { Brain } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

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
      <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-6">
        <div className="flex items-center gap-2 text-indigo-400">
          <Brain size={40} />
          <h1 className="text-4xl font-bold">MindTrack AI</h1>
        </div>

        <p className="text-slate-400 max-w-lg">
          Analyze social media posts to detect mental health signals with AI-powered insights.
        </p>

        <Button onClick={handleStart}>Get Started</Button>
      </div>
    </MainLayout>
  );
}