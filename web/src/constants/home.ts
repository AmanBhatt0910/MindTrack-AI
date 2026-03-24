import { Brain, Globe, BarChart2, ShieldCheck, Zap, MessageSquare } from "lucide-react";

// ─── Features Section ──────────────────────────────────────────────────────────
export const FEATURES = [
  {
    icon: Brain,
    title: "AI Detection",
    description:
      "Identify nuanced mental health patterns using state-of-the-art transformer models trained on clinical datasets.",
    tag: "Core",
  },
  {
    icon: Globe,
    title: "Multi-language",
    description:
      "Analyze posts across 30+ languages seamlessly — the model understands context, not just keywords.",
    tag: "Global",
  },
  {
    icon: BarChart2,
    title: "Explainable AI",
    description:
      "Every prediction comes with SHAP-based explanations so you understand exactly why the model flagged a signal.",
    tag: "Transparent",
  },
  {
    icon: ShieldCheck,
    title: "Privacy First",
    description:
      "No data is stored after analysis. Posts are processed ephemerally and never used for model training.",
    tag: "Secure",
  },
  {
    icon: Zap,
    title: "Real-time Analysis",
    description:
      "Get results in under 2 seconds. Optimized inference pipeline built for scale and low latency.",
    tag: "Fast",
  },
  {
    icon: MessageSquare,
    title: "Contextual Insights",
    description:
      "Beyond classification — receive actionable context and severity indicators to inform next steps.",
    tag: "Actionable",
  },
] as const;

// ─── How It Works Section ──────────────────────────────────────────────────────
export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Paste a Post",
    description:
      "Input any social media text — tweet, Reddit post, Facebook update — in any language.",
  },
  {
    step: "02",
    title: "Select Language",
    description:
      "Choose the source language or let the model auto-detect it for you.",
  },
  {
    step: "03",
    title: "Receive Analysis",
    description:
      "Get a detailed breakdown: classification label, confidence score, and word-level explanations.",
  },
] as const;

// ─── Stats Bar ─────────────────────────────────────────────────────────────────
export const STATS = [
  { value: "94.2%", label: "Detection accuracy" },
  { value: "30+", label: "Languages supported" },
  { value: "<2s", label: "Average latency" },
  { value: "1M+", label: "Posts analyzed" },
] as const;

// ─── CTA ───────────────────────────────────────────────────────────────────────
export const CTA_HEADLINE = "Start detecting mental health signals today.";
export const CTA_SUBLINE =
  "Built for researchers, clinicians, and platform safety teams. Free to start.";