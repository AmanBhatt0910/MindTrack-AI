import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SoundEffects } from "@/features/games/utils/soundEffects";

interface MemoryMatchProps {
  onComplete?: (score: number) => void;
}

export default function MemoryMatchGame({ onComplete }: MemoryMatchProps) {
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameActive, setGameActive] = useState(true);

  // Emojis for the cards
  const [cards, setCards] = useState<{ id: number; emoji: string }[]>([]);

  useEffect(() => {
    const emojis = ["🦊", "🐼", "🐸", "🦋", "🍄", "🌺", "🌙", "⭐"];
    const pairs = [...emojis, ...emojis];
    // Shuffle
    const shuffled = pairs.sort(() => Math.random() - 0.5).map((emoji, index) => ({ id: index, emoji }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setCards(shuffled);
  }, []);

  const toggleFlip = (id: number) => {
    if (matched.includes(id) || flipped.includes(id) || !gameActive || flipped.length >= 2) return;

    SoundEffects.cardFlip();
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);

      const [first, second] = newFlipped;
      if (cards[first].emoji === cards[second].emoji) {
        // Match!
        setTimeout(() => {
          setMatched((prev) => [...prev, first, second]);
          setFlipped([]);
          SoundEffects.matchSuccess();
          
          if (matched.length + 2 === cards.length) {
            setGameActive(false);
            const score = Math.max(100 - moves * 2, 10);
            setTimeout(() => onComplete?.(score), 500);
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold text-[var(--text)]">
          Matches: {matched.length / 2} / 8
        </div>
        <div className="text-sm font-medium px-3 py-1 bg-[var(--surface-raised)] rounded-full">
          Moves: {moves}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/10 rounded-2xl border border-purple-500/20 shadow-inner">
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
          const isMatched = matched.includes(card.id);
          
          return (
            <motion.button
              key={card.id}
              onClick={() => toggleFlip(card.id)}
              className="relative aspect-square rounded-xl w-full"
              style={{ perspective: 1000 }}
              whileHover={!isFlipped ? { scale: 1.05 } : {}}
              whileTap={!isFlipped ? { scale: 0.95 } : {}}
            >
              <motion.div
                className="w-full h-full absolute inset-0"
                style={{ transformStyle: "preserve-3d" }}
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 20 }}
              >
                {/* Back of card (unflipped) */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-purple-500/40 to-indigo-600/40 border-2 border-purple-400/30 rounded-xl flex items-center justify-center shadow-md"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="w-8 h-8 rounded-full bg-white/10" />
                </div>
                
                {/* Front of card (flipped) */}
                <div 
                  className={`absolute inset-0 rounded-xl border-2 flex items-center justify-center text-4xl shadow-lg bg-[var(--surface)] ${
                    isMatched ? "border-green-500/50 bg-green-500/10 shadow-green-500/20" : "border-purple-400/50"
                  }`}
                  style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: isFlipped ? 1 : 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {card.emoji}
                  </motion.div>
                </div>
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
