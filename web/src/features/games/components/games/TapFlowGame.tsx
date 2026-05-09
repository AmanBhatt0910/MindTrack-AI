import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SoundEffects } from "@/features/games/utils/soundEffects";

interface TapFlowProps {
  onComplete?: (score: number) => void;
}

interface Target {
  id: number;
  x: number;
  y: number;
  createdAt: number;
  type: "normal" | "bonus";
}

export default function TapFlowGame({ onComplete }: TapFlowProps) {
  const [targets, setTargets] = useState<Target[]>([]);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [combo, setCombo] = useState(0);
  
  const targetIdRef = useRef(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let spawnTimer: NodeJS.Timeout;
    let clockTimer: NodeJS.Timeout;

    if (gameActive && timeLeft > 0) {
      // Game Clock
      clockTimer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameActive(false);
            setTimeout(() => onComplete?.(score), 1000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Target Spawner
      const spawnRate = Math.max(400, 1000 - (30 - timeLeft) * 20); // gets faster
      
      const spawnTarget = () => {
        if (!gameAreaRef.current) return;
        
        const isBonus = Math.random() > 0.8;
        const newTarget: Target = {
          id: targetIdRef.current++,
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10,
          createdAt: Date.now(),
          type: isBonus ? "bonus" : "normal",
        };

        setTargets((prev) => [...prev, newTarget]);

        // Auto remove if missed
        setTimeout(() => {
          setTargets((prev) => {
            const exists = prev.find(t => t.id === newTarget.id);
            if (exists) {
              setCombo(0); // Reset combo on miss
              return prev.filter(t => t.id !== newTarget.id);
            }
            return prev;
          });
        }, 1500);

        spawnTimer = setTimeout(spawnTarget, spawnRate);
      };

      spawnTimer = setTimeout(spawnTarget, spawnRate);
    }

    return () => {
      clearInterval(clockTimer);
      clearTimeout(spawnTimer);
    };
  }, [gameActive, timeLeft, score, onComplete]);

  const handleTap = (target: Target, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!gameActive) return;

    SoundEffects.tapSuccess();
    
    // Calculate points based on speed
    // eslint-disable-next-line react-hooks/purity
    const timeToReact = Date.now() - target.createdAt;
    let points = target.type === "bonus" ? 30 : 10;
    
    if (timeToReact < 500) points += 5; // Quick tap bonus
    
    // Apply combo multiplier
    const multiplier = 1 + Math.floor(combo / 5) * 0.5;
    const totalPoints = Math.floor(points * multiplier);

    setScore((prev) => prev + totalPoints);
    setCombo((prev) => prev + 1);
    setTargets((prev) => prev.filter((t) => t.id !== target.id));
  };

  const startGame = () => {
    setScore(0);
    setCombo(0);
    setTimeLeft(30);
    setTargets([]);
    setGameActive(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <div className="text-xl font-bold text-[var(--text)]">
            Score: <span className="text-indigo-500">{score}</span>
          </div>
          {combo > 2 && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-xl font-bold text-orange-500 italic"
            >
              {combo}x Combo!
            </motion.div>
          )}
        </div>
        <div className="text-lg font-mono font-bold bg-[var(--surface-raised)] px-4 py-1 rounded-full">
          00:{timeLeft.toString().padStart(2, "0")}
        </div>
      </div>

      <div 
        ref={gameAreaRef}
        className="relative w-full h-[400px] bg-gradient-to-br from-indigo-900/20 to-purple-900/10 rounded-3xl border border-indigo-500/20 overflow-hidden"
      >
        {!gameActive && timeLeft === 30 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
            <button
              onClick={startGame}
              className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl text-xl transition-transform hover:scale-105 shadow-lg shadow-indigo-500/30"
            >
              Start Flow
            </button>
          </div>
        )}

        {!gameActive && timeLeft === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-20">
            <h2 className="text-4xl font-bold text-white mb-2">Time&apos;s Up!</h2>
            <p className="text-2xl text-indigo-300 mb-8">Final Score: {score}</p>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-white text-indigo-900 font-bold rounded-xl transition-transform hover:scale-105"
            >
              Play Again
            </button>
          </div>
        )}

        <AnimatePresence>
          {targets.map((target) => (
            <motion.button
              key={target.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              whileTap={{ scale: 0.8 }}
              onMouseDown={(e) => handleTap(target, e)}
              className={`absolute w-16 h-16 rounded-full flex items-center justify-center cursor-pointer shadow-lg backdrop-blur-sm
                ${target.type === "bonus" 
                  ? "bg-gradient-to-tr from-yellow-400 to-orange-500 border-2 border-yellow-200" 
                  : "bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-indigo-300"
                }
              `}
              style={{
                left: `${target.x}%`,
                top: `${target.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className={`w-8 h-8 rounded-full ${target.type === "bonus" ? "bg-yellow-200/50" : "bg-white/30"}`} />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
