import {
  LayoutDashboard,
  FileText,
  History,
  Settings,
  LogOut,
} from "lucide-react";

// ─── Nav links ────────────────────────────────────────────────────────────────
export const SIDEBAR_NAV = [
  { label: "Overview",  href: "/dashboard",          icon: LayoutDashboard },
  { label: "Analyze",   href: "/dashboard#analyzer", icon: FileText        },
  { label: "History",   href: "/dashboard#history",  icon: History         },
  { label: "Settings",  href: "/settings",           icon: Settings        },
] as const;

export const SIDEBAR_BOTTOM = [
  { label: "Log out", href: "/login", icon: LogOut },
] as const;

// ─── Stats cards ──────────────────────────────────────────────────────────────
export const STATS = [
  {
    label:  "Total Analyses",
    value:  "24",
    trend:  "+4 this week",
    up:     true,
    color:  "accent" as const,
  },
  {
    label:  "High Risk",
    value:  "5",
    trend:  "+1 this week",
    up:     false,
    color:  "danger" as const,
  },
  {
    label:  "Moderate",
    value:  "8",
    trend:  "same as last week",
    up:     null,
    color:  "warning" as const,
  },
  {
    label:  "Neutral",
    value:  "11",
    trend:  "+3 this week",
    up:     true,
    color:  "success" as const,
  },
] as const;

// ─── Chart data ───────────────────────────────────────────────────────────────
export const CHART_DATA = [
  { day: "Mon", Depression: 2, Anxiety: 1, Stress: 0, Neutral: 3 },
  { day: "Tue", Depression: 1, Anxiety: 2, Stress: 1, Neutral: 4 },
  { day: "Wed", Depression: 3, Anxiety: 0, Stress: 2, Neutral: 2 },
  { day: "Thu", Depression: 1, Anxiety: 1, Stress: 0, Neutral: 5 },
  { day: "Fri", Depression: 2, Anxiety: 2, Stress: 1, Neutral: 3 },
  { day: "Sat", Depression: 0, Anxiety: 1, Stress: 0, Neutral: 4 },
  { day: "Sun", Depression: 1, Anxiety: 0, Stress: 1, Neutral: 2 },
] as const;

export const CHART_COLORS = {
  Depression: "#ef4444",
  Anxiety:    "#f59e0b",
  Stress:     "#8b5cf6",
  Neutral:    "#10b981",
} as const;

// ─── Languages ────────────────────────────────────────────────────────────────
export const LANGUAGES = [
  { value: "en", label: "English"    },
  { value: "hi", label: "Hindi"      },
  { value: "es", label: "Spanish"    },
  { value: "fr", label: "French"     },
  { value: "de", label: "German"     },
  { value: "pt", label: "Portuguese" },
  { value: "ar", label: "Arabic"     },
  { value: "zh", label: "Chinese"    },
] as const;

// ─── Prediction → badge variant mapping ───────────────────────────────────────
export const PREDICTION_VARIANT = {
  Depression: "danger",
  Anxiety: "warning",
  Stress: "warning",
  Bipolar: "warning",
  Neutral: "success",
} as const;

// ─── Post analyzer copy ───────────────────────────────────────────────────────
export const ANALYZER_COPY = {
  placeholder:
    "Paste a social media post here — tweet, Reddit post, Facebook update, or any text…",
  maxChars: 1000,
  emptyState: "Run an analysis to see results here.",
} as const;

// ─── Settings ─────────────────────────────────────────────────────────────────
export const SETTINGS_TABS = [
  { id: "profile",       label: "Profile"        },
  { id: "notifications", label: "Notifications"  },
  { id: "api",           label: "API & Integrations" },
  { id: "danger",        label: "Danger zone"    },
] as const;

export type SettingsTabId = typeof SETTINGS_TABS[number]["id"];

export const NOTIFICATION_PREFS = [
  {
    id:          "high_risk",
    label:       "High-risk alerts",
    description: "Get notified immediately when a post is classified as high risk.",
  },
  {
    id:          "weekly_digest",
    label:       "Weekly digest",
    description: "Receive a summary of all analyses every Monday morning.",
  },
  {
    id:          "model_updates",
    label:       "Model updates",
    description: "Know when the detection model is retrained or updated.",
  },
] as const;