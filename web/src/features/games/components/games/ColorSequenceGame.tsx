import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { SoundEffects } from "@/features/games/utils/soundEffects";

interface ColorSequenceGameProps {
  onComplete?: (score: number) => void;
}

const COLORS = [
  { id: 0, color: "bg-red-500", activeColor: "bg-red-400", shadow: "shadow-red-500/50" },
  { id: 1, color: "bg-green-500", activeColor: "bg-green-400", shadow: "shadow-green-500/50" },
  { id: 2, color: "bg-blue-500", activeColor: "bg-blue-400", shadow: "shadow-blue-500/50" },
  { id: 3, color: "bg-yellow-500", activeColor: "bg-yellow-400", shadow: "shadow-yellow-500/50" },
];

export default function ColorSequenceGame({ onComplete }: ColorSequenceGameProps) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [activeColor, setActiveColor] = useState<number | null>(null);
  const [level, setLevel] = useState(0);
  const [gameStatus, setGameStatus] = useState<"idle" | "playing" | "gameover">("idle");
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
    setSequence([]);
    setPlayerSequence([]);
    setLevel(1);
    setGameStatus("playing");
    addNextColor([]);
  };

  const addNextColor = (currentSequence: number[]) => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const nextColor = Math.floor(Math.random() * 4);
    const newSequence = [...currentSequence, nextColor];
    setSequence(newSequence);
    playSequence(newSequence);
  };

  const playSequence = async (seq: number[]) => {
    setIsPlayingSequence(true);
    // Wait a bit before starting
    await new Promise((resolve) => setTimeout(resolve, 800));

    for (let i = 0; i < seq.length; i++) {
      if (gameStatus === "gameover") break;
      
      setActiveColor(seq[i]);
      SoundEffects.colorClick();
      
      await new Promise((resolve) => setTimeout(resolve, 400));
      setActiveColor(null);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    
    setIsPlayingSequence(false);
    setPlayerSequence([]);
  };

  const handleColorClick = (colorId: number) => {
    if (isPlayingSequence || gameStatus !== "playing") return;

    SoundEffects.colorClick();
    setActiveColor(colorId);
    
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setActiveColor(null), 200);

    const newPlayerSeq = [...playerSequence, colorId];
    setPlayerSequence(newPlayerSeq);

    // Check if correct
    const currentIndex = newPlayerSeq.length - 1;
    if (newPlayerSeq[currentIndex] !== sequence[currentIndex]) {
      // Wrong!
      SoundEffects.wrongSequence();
      setGameStatus("gameover");
      onComplete?.(level * 10);
      return;
    }

    // Check if sequence complete
    if (newPlayerSeq.length === sequence.length) {
      setLevel((prev) => prev + 1);
      SoundEffects.levelUp();
      addNextColor(sequence);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-xl font-bold text-[var(--text)]">Level {level}</div>
        <div className="text-sm font-medium px-3 py-1 bg-[var(--surface-raised)] rounded-full text-[var(--text-muted)]">
          {gameStatus === "playing" ? (isPlayingSequence ? "Watch..." : "Your Turn!") : "Simon Says"}
        </div>
      </div>

      <div className="relative p-8 bg-[var(--surface-raised)] rounded-3xl flex justify-center border border-[var(--border)] shadow-inner">
        {gameStatus === "gameover" && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-3xl z-10 flex flex-col items-center justify-center">
            <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
            <p className="text-white/80 mb-6">You reached Level {level}</p>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform"
            >
              Play Again
            </button>
          </div>
        )}

        {gameStatus === "idle" && (
           <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-3xl z-10 flex flex-col items-center justify-center">
           <button
             onClick={startGame}
             className="px-8 py-4 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold rounded-xl text-xl hover:scale-105 transition-transform shadow-lg shadow-pink-500/30"
           >
             Start Game
           </button>
         </div>
        )}

        <div className="grid grid-cols-2 gap-4 max-w-xs w-full aspect-square">
          {COLORS.map((c) => {
            const isActive = activeColor === c.id;
            return (
              <motion.button
                key={c.id}
                whileTap={!isPlayingSequence && gameStatus === "playing" ? { scale: 0.9 } : {}}
                onClick={() => handleColorClick(c.id)}
                disabled={isPlayingSequence || gameStatus !== "playing"}
                className={`rounded-2xl transition-all duration-150 ${
                  isActive ? `${c.activeColor} scale-105 shadow-xl ${c.shadow}` : `${c.color} opacity-70`
                }`}
                style={{
                  boxShadow: isActive ? "inset 0 0 20px rgba(255,255,255,0.5)" : "inset 0 -4px 10px rgba(0,0,0,0.2)"
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
