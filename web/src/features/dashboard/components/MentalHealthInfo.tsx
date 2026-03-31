"use client";

import { Brain, Zap, Heart, Sun, Shield, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

const MENTAL_HEALTH_TOPICS = [
  {
    icon: Brain,
    titleEn: "What is Depression?",
    titleHi: "अवसाद क्या है?",
    descriptionEn:
      "A mood disorder causing persistent sadness, loss of interest, and difficulty carrying out daily activities.",
    descriptionHi:
      "एक मूड डिसऑर्डर जो लगातार उदासी, रुचि की हानि और दैनिक गतिविधियों में कठिनाई का कारण बनता है।",
    tipsEn: ["Talk to someone you trust", "Maintain a daily routine", "Exercise regularly"],
    tipsHi: ["किसी भरोसेमंद से बात करें", "दैनिक दिनचर्या बनाए रखें", "नियमित व्यायाम करें"],
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.15)",
  },
  {
    icon: Zap,
    titleEn: "Understanding Anxiety",
    titleHi: "चिंता को समझना",
    descriptionEn:
      "An emotional state involving excessive fear or worry that can interfere significantly with daily activities.",
    descriptionHi:
      "अत्यधिक भय या चिंता की भावना जो दैनिक गतिविधियों को महत्वपूर्ण रूप से बाधित कर सकती है।",
    tipsEn: ["Practice deep breathing", "Limit caffeine intake", "Try mindfulness meditation"],
    tipsHi: ["गहरी सांस लें", "कैफीन का सेवन सीमित करें", "माइंडफुलनेस मेडिटेशन आजमाएं"],
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.15)",
  },
  {
    icon: Heart,
    titleEn: "Stress Management",
    titleHi: "तनाव प्रबंधन",
    descriptionEn:
      "Chronic stress can harm both mental and physical health. Learning to manage it is crucial for well-being.",
    descriptionHi:
      "पुराना तनाव मानसिक और शारीरिक स्वास्थ्य दोनों को नुकसान पहुंचा सकता है। इसे प्रबंधित करना जरूरी है।",
    tipsEn: ["Identify your stress triggers", "Take regular breaks", "Connect with loved ones"],
    tipsHi: ["तनाव के कारण पहचानें", "नियमित ब्रेक लें", "प्रियजनों से जुड़ें"],
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.15)",
  },
  {
    icon: Sun,
    titleEn: "Self-Care Practices",
    titleHi: "आत्म-देखभाल",
    descriptionEn:
      "Simple daily habits that can significantly improve your overall mental well-being and resilience.",
    descriptionHi:
      "सरल दैनिक आदतें जो आपके समग्र मानसिक स्वास्थ्य और लचीलेपन में काफी सुधार कर सकती हैं।",
    tipsEn: ["Sleep 7–9 hours nightly", "Eat nutritious meals", "Spend time outdoors daily"],
    tipsHi: ["7–9 घंटे सोएं", "पोषक भोजन खाएं", "रोज बाहर समय बिताएं"],
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.15)",
  },
  {
    icon: Shield,
    titleEn: "When to Seek Help",
    titleHi: "मदद कब लें",
    descriptionEn:
      "Recognizing when professional support is needed is a sign of strength, not weakness.",
    descriptionHi:
      "जब पेशेवर सहायता की जरूरत हो तो उसे पहचानना कमजोरी नहीं, बल्कि ताकत की निशानी है।",
    tipsEn: [
      "Symptoms lasting 2+ weeks",
      "Significant impairment in daily functioning",
      "Thoughts of self-harm",
    ],
    tipsHi: [
      "2+ सप्ताह तक लक्षण",
      "दैनिक कार्यों में बड़ी बाधा",
      "स्वयं को नुकसान पहुंचाने के विचार",
    ],
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.08)",
    border: "rgba(6,182,212,0.15)",
  },
  {
    icon: BookOpen,
    titleEn: "Mental Health Resources",
    titleHi: "मानसिक स्वास्थ्य संसाधन",
    descriptionEn:
      "Educational materials and tools to help you better understand and manage your mental health.",
    descriptionHi:
      "आपके मानसिक स्वास्थ्य को बेहतर समझने और प्रबंधित करने के लिए शैक्षणिक सामग्री और उपकरण।",
    tipsEn: ["NIMHANS free resources", "iCall free counselling", "Vandrevala helpline 24/7"],
    tipsHi: [
      "NIMHANS मुफ्त संसाधन",
      "iCall मुफ्त परामर्श",
      "वंड्रेवाला हेल्पलाइन 24/7",
    ],
    color: "#ec4899",
    bg: "rgba(236,72,153,0.08)",
    border: "rgba(236,72,153,0.15)",
  },
];

export default function MentalHealthInfo() {
  const { t, language } = useTranslation();

  return (
    <section id="mental-health-info" className="space-y-4 scroll-mt-20">
      {/* Section header */}
      <div className="flex items-center gap-2 pb-1">
        <div className="size-1.5 rounded-full bg-[var(--accent)] pulse-dot" aria-hidden />
        <h2 className="text-sm font-semibold text-[var(--text)] tracking-[-0.01em]">
          {t("mentalHealthTitle")}
        </h2>
      </div>
      <p className="text-xs text-[var(--text-muted)] max-w-2xl -mt-2">
        {t("mentalHealthSubtitle")}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MENTAL_HEALTH_TOPICS.map((topic, i) => {
          const Icon = topic.icon;
          const title = language === "hi" ? topic.titleHi : topic.titleEn;
          const description = language === "hi" ? topic.descriptionHi : topic.descriptionEn;
          const tips = language === "hi" ? topic.tipsHi : topic.tipsEn;

          return (
            <motion.div
              key={topic.titleEn}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-3 p-5 rounded-[var(--radius-lg)]
                         bg-[var(--surface)] border border-[var(--border)]
                         hover:border-[var(--border-active)] transition-all duration-200"
            >
              {/* Icon */}
              <div
                className="size-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: topic.bg, border: `1px solid ${topic.border}` }}
              >
                <Icon size={16} style={{ color: topic.color }} />
              </div>

              {/* Title + description */}
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[var(--text)] leading-snug">
                  {title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Tips */}
              <div className="space-y-1.5 pt-1 border-t border-[var(--border)]">
                <p className="text-[10px] uppercase tracking-wide font-medium text-[var(--text-muted)]">
                  {t("tips")}
                </p>
                <ul className="space-y-1">
                  {tips.map((tip) => (
                    <li key={tip} className="flex items-start gap-1.5">
                      <span
                        className="mt-1.5 size-1 rounded-full shrink-0"
                        style={{ background: topic.color }}
                        aria-hidden
                      />
                      <span className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {tip}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
