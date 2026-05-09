import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { SoundEffects } from "@/features/games/utils/soundEffects";

interface BubblePopProps {
  onComplete?: (score: number) => void;
}

export default function BubblePopGame({ onComplete }: BubblePopProps) {
  const [score, setScore] = useState(0);
  const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);
  const [nextId, setNextId] = useState(0);
  const [gameActive, setGameActive] = useState(true);

  const generateBubble = () => {
    if (bubbles.length < 20) {
      const size = Math.random() * 40 + 40; // 40px to 80px
      const newBubble = {
        id: nextId,
        x: Math.random() * 80 + 10, // 10% to 90%
        y: Math.random() * 80 + 10,
        size,
      };
      setBubbles((prev) => [...prev, newBubble]);
      setNextId((prev) => prev + 1);
    }
  };

  const popBubble = (id: number) => {
    setScore((prev) => prev + 1);
    setBubbles((prev) => prev.filter((b) => b.id !== id));
    SoundEffects.bubblePop();

    if (score >= 19 && bubbles.length === 1) { // 20 popped
      setGameActive(false);
      setTimeout(() => {
        onComplete?.(score + 1);
      }, 500);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-blue-500">{score} / 20 bubbles</div>
        <button
          onClick={() => {
            setScore(0);
            setBubbles([]);
            setGameActive(true);
            setNextId(0);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--surface-raised)] text-xs font-medium text-[var(--text)] hover:bg-[var(--surface)] transition"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>

      <div className="relative w-full bg-gradient-to-br from-blue-900/30 to-cyan-900/10 rounded-2xl border border-blue-500/20 overflow-hidden h-[400px] shadow-inner">
        {gameActive && bubbles.length < 20 && (
          <div
            onClick={generateBubble}
            className="absolute inset-0 flex items-center justify-center text-blue-400/50 hover:text-blue-400 transition cursor-pointer"
          >
            <span className="bg-blue-500/10 px-4 py-2 rounded-full backdrop-blur-sm">Click to add bubbles...</span>
          </div>
        )}

        <AnimatePresence>
          {bubbles.map((bubble) => (
            <motion.button
              key={bubble.id}
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.5, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                popBubble(bubble.id);
              }}
              className="absolute rounded-full bg-gradient-to-br from-blue-400/80 to-cyan-300/60 shadow-lg border-2 border-white/40 hover:shadow-cyan-500/50 transition-shadow cursor-pointer backdrop-blur-sm"
              style={{
                width: bubble.size,
                height: bubble.size,
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="absolute top-[15%] left-[20%] w-[25%] h-[25%] rounded-full bg-white/60 blur-[1px]"></div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
