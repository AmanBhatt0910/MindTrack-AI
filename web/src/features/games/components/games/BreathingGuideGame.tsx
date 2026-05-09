import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface BreathingGuideProps {
  onComplete?: (score: number) => void;
}

export default function BreathingGuideGame({ onComplete }: BreathingGuideProps) {
  const [cycle, setCycle] = useState(0);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "idle">("idle");
  const [isActive, setIsActive] = useState(false);
  const totalCycles = 8;

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isActive) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (phase === "idle") {
        setPhase("inhale");
      } else if (phase === "inhale") {
        timeoutId = setTimeout(() => setPhase("hold"), 4000);
      } else if (phase === "hold") {
        timeoutId = setTimeout(() => setPhase("exhale"), 4000);
      } else if (phase === "exhale") {
        timeoutId = setTimeout(() => {
          const nextCycle = cycle + 1;
          if (nextCycle >= totalCycles) {
            setIsActive(false);
            setPhase("idle");
            onComplete?.(50); // Base score for completing
          } else {
            setCycle(nextCycle);
            setPhase("inhale");
          }
        }, 8000);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [isActive, phase, cycle, onComplete]);

  const startBreathing = () => {
    setIsActive(true);
    setCycle(0);
    setPhase("inhale");
  };

  const getInstructions = () => {
    switch (phase) {
      case "inhale": return "Breathe In...";
      case "hold": return "Hold...";
      case "exhale": return "Breathe Out...";
      default: return "Ready?";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-8 p-10 rounded-3xl bg-gradient-to-b from-cyan-900/40 to-blue-900/10 border border-cyan-500/20 shadow-inner overflow-hidden relative">
        {/* Ambient background rings */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                delay: i * 2,
                ease: "easeInOut",
              }}
              className="absolute rounded-full border border-cyan-300/30"
              style={{ width: `${i * 100}px`, height: `${i * 100}px` }}
            />
          ))}
        </div>

        <div className="relative w-48 h-48 flex items-center justify-center z-10">
          {/* Breathing Circle */}
          <motion.div
            animate={{
              scale: phase === "inhale" ? 1.5 : phase === "hold" ? 1.5 : phase === "exhale" ? 0.8 : 1,
              backgroundColor: phase === "inhale" ? "rgba(34, 211, 238, 0.2)" : 
                               phase === "hold" ? "rgba(34, 211, 238, 0.3)" :
                               phase === "exhale" ? "rgba(34, 211, 238, 0.1)" : "rgba(34, 211, 238, 0.05)",
              borderColor: phase === "hold" ? "rgba(34, 211, 238, 0.8)" : "rgba(34, 211, 238, 0.4)",
            }}
            transition={{ 
              duration: phase === "inhale" ? 4 : phase === "hold" ? 4 : phase === "exhale" ? 8 : 1,
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-full border-4 flex items-center justify-center backdrop-blur-sm shadow-[0_0_30px_rgba(34,211,238,0.2)]"
          >
          </motion.div>
          
          <div className="text-center z-20">
            <motion.div 
              key={phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-cyan-100 tracking-wide"
            >
              {getInstructions()}
            </motion.div>
          </div>
        </div>

        <div className="text-center z-10">
          <p className="text-sm text-cyan-200/60 font-medium tracking-widest uppercase">
            Cycle {cycle + 1} of {totalCycles}
          </p>
        </div>

        {!isActive && phase === "idle" && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startBreathing}
            className="px-8 py-3 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/50 hover:bg-cyan-500/30 transition-colors shadow-[0_0_20px_rgba(34,211,238,0.2)] z-10"
          >
            Start Session
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className={`p-4 rounded-xl border transition-colors ${phase === "inhale" ? "bg-cyan-500/20 border-cyan-400" : "bg-[var(--surface)] border-[var(--border)]"}`}>
          <div className="text-xs text-[var(--text-muted)] uppercase mb-1">Inhale</div>
          <div className="text-lg font-bold text-[var(--text)]">4s</div>
        </div>
        <div className={`p-4 rounded-xl border transition-colors ${phase === "hold" ? "bg-cyan-500/20 border-cyan-400" : "bg-[var(--surface)] border-[var(--border)]"}`}>
          <div className="text-xs text-[var(--text-muted)] uppercase mb-1">Hold</div>
          <div className="text-lg font-bold text-[var(--text)]">4s</div>
        </div>
        <div className={`p-4 rounded-xl border transition-colors ${phase === "exhale" ? "bg-cyan-500/20 border-cyan-400" : "bg-[var(--surface)] border-[var(--border)]"}`}>
          <div className="text-xs text-[var(--text-muted)] uppercase mb-1">Exhale</div>
          <div className="text-lg font-bold text-[var(--text)]">8s</div>
        </div>
      </div>
    </div>
  );
}
