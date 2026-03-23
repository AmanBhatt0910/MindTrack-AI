"use client";

import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import Button from "@/components/ui/Button";

export default function Hero({
  onStart,
}: {
  onStart: () => void;
}) {
  return (
    <section className="relative text-center py-24 space-y-6">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-3xl -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-2 text-indigo-400"
      >
        <Brain size={40} />
        <h1 className="text-5xl font-bold">MindTrack AI</h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-slate-400 max-w-xl mx-auto text-lg"
      >
        Detect mental health signals from social media using AI-powered
        analysis with explainable insights.
      </motion.p>

      <motion.div whileHover={{ scale: 1.05 }}>
        <Button onClick={onStart}>Get Started</Button>
      </motion.div>
    </section>
  );
}