"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Volume2, VolumeX } from "lucide-react";
import { MINI_GAMES, GAME_CATEGORIES } from "@/features/games/services/games.service";
import { MiniGame } from "@/features/games/types/games.types";

// ─── Sub-components ───────────────────────────────────────────────────────────

interface BubblePopProps {
  onComplete?: (score: number) => void;
}

function BubblePopGame({ onComplete }: BubblePopProps) {
  const [score, setScore] = useState(0);
  const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [nextId, setNextId] = useState(0);
  const [gameActive, setGameActive] = useState(true);

  const generateBubble = () => {
    if (bubbles.length < 15) {
      const newBubble = {
        id: nextId,
        x: Math.random() * 80,
        y: Math.random() * 80,
      };
      setBubbles((prev) => [...prev, newBubble]);
      setNextId((prev) => prev + 1);
    }
  };

  const popBubble = (id: number) => {
    setScore((prev) => prev + 1);
    setBubbles((prev) => prev.filter((b) => b.id !== id));
    
    // Play sound effect
    const audio = new Audio("/sounds/bubble-pop.mp3");
    audio.volume = 0.3;
    audio.play().catch(() => {});

    if (bubbles.length === 1) {
      setGameActive(false);
      onComplete?.(score + 1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-[var(--accent)]">{score} bubbles popped</div>
        <button
          onClick={() => {
            setScore(0);
            setBubbles([]);
            setGameActive(true);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--surface-raised)] text-xs font-medium text-[var(--text)] hover:bg-[var(--surface)] transition"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>

      <div className="relative w-full bg-gradient-to-br from-blue-900/20 to-blue-900/5 rounded-lg border border-blue-500/20 overflow-hidden h-96">
        {gameActive && bubbles.length < 15 && (
          <button
            onClick={generateBubble}
            className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] transition"
          >
            Click to add bubbles...
          </button>
        )}

        {bubbles.map((bubble) => (
          <motion.button
            key={bubble.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => popBubble(bubble.id)}
            className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg border-2 border-blue-300 hover:shadow-xl transition-shadow cursor-pointer"
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>

      <p className="text-sm text-[var(--text-secondary)]">
        Pop bubbles to release stress. Generate up to 15 bubbles and pop them all!
      </p>
    </div>
  );
}

interface MemoryMatchProps {
  onComplete?: (score: number) => void;
}

function MemoryMatchGame({ onComplete }: MemoryMatchProps) {
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameActive, setGameActive] = useState(true);

  const cards = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    emoji: "🎨🌟💎🎯🌈🎪🎭🎬🎤🎸🎹🎺".split("")[i % 12],
  }));

  const toggleFlip = (id: number) => {
    if (matched.includes(id) || flipped.includes(id) || !gameActive) return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);

      const [first, second] = newFlipped;
      if (cards[first].emoji === cards[second].emoji) {
        setMatched((prev) => [...prev, first, second]);
        setFlipped([]);

        if (matched.length + 2 === cards.length) {
          setGameActive(false);
          onComplete?.(12 - moves);
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold text-[var(--text)]">
          Matches: {matched.length / 2} / 6
        </div>
        <div className="text-sm text-[var(--text-muted)]">Moves: {moves}</div>
      </div>

      <div className="grid grid-cols-4 gap-2 p-4 bg-gradient-to-br from-purple-900/20 to-purple-900/5 rounded-lg border border-purple-500/20">
        {cards.map((card) => (
          <motion.button
            key={card.id}
            onClick={() => toggleFlip(card.id)}
            className="aspect-square rounded-lg border-2 transition-all flex items-center justify-center text-3xl font-bold"
            animate={{
              rotateY: flipped.includes(card.id) || matched.includes(card.id) ? 0 : 180,
              backgroundColor:
                matched.includes(card.id)
                  ? "rgb(168, 85, 247, 0.1)"
                  : flipped.includes(card.id)
                    ? "rgb(168, 85, 247, 0.2)"
                    : "transparent",
              borderColor: matched.includes(card.id)
                ? "rgb(168, 85, 247, 0.5)"
                : "rgb(168, 85, 247, 0.3)",
            }}
            whileHover={{ scale: 1.05 }}
          >
            {flipped.includes(card.id) || matched.includes(card.id) ? card.emoji : "?"}
          </motion.button>
        ))}
      </div>

      {!gameActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center text-green-400"
        >
          🎉 Complete in {moves} moves!
        </motion.div>
      )}
    </div>
  );
}

interface BreathingGuideProps {
  onComplete?: () => void;
}

function BreathingGuideGame({ onComplete }: BreathingGuideProps) {
  const [cycle, setCycle] = useState(0);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [isActive, setIsActive] = useState(false);

  const startBreathing = () => {
    setIsActive(true);
    let currentCycle = 0;
    let currentPhase: "inhale" | "hold" | "exhale" = "inhale";

    const runCycle = () => {
      if (currentCycle >= 8) {
        setIsActive(false);
        onComplete?.();
        return;
      }

      if (currentPhase === "inhale") {
        setPhase("inhale");
        currentPhase = "hold";
        setTimeout(runCycle, 4000);
      } else if (currentPhase === "hold") {
        setPhase("hold");
        currentPhase = "exhale";
        setTimeout(runCycle, 4000);
      } else {
        setPhase("exhale");
        currentPhase = "inhale";
        currentCycle++;
        setCycle(currentCycle);
        setTimeout(runCycle, 8000);
      }
    };

    runCycle();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-6 p-8 rounded-lg bg-gradient-to-br from-cyan-900/20 to-cyan-900/5 border border-cyan-500/20">
        <div className="relative w-40 h-40">
          <motion.div
            animate={{
              scale: phase === "inhale" ? 1.5 : phase === "hold" ? 1.5 : 1,
              opacity: phase === "exhale" ? 0.5 : 1,
            }}
            transition={{ duration: phase === "exhale" ? 8 : 4 }}
            className="absolute inset-0 rounded-full border-4 border-cyan-400 flex items-center justify-center"
          >
            <div className="text-4xl font-bold text-cyan-400">
              {phase === "inhale" ? "4" : phase === "hold" ? "4" : "8"}
            </div>
          </motion.div>
        </div>

        <div className="text-center">
          <p className="text-2xl font-bold text-[var(--text)] capitalize mb-2">{phase}</p>
          <p className="text-sm text-[var(--text-muted)]">Cycle {cycle + 1} / 8</p>
        </div>

        <button
          onClick={startBreathing}
          disabled={isActive}
          className="px-6 py-2 rounded-lg bg-cyan-500 text-white font-medium hover:bg-cyan-600 disabled:opacity-50 transition"
        >
          {isActive ? "In Progress..." : "Start"}
        </button>
      </div>

      <div className="text-sm text-[var(--text-secondary)] space-y-2">
        <p>✓ Breathe in for 4 seconds</p>
        <p>✓ Hold for 4 seconds</p>
        <p>✓ Breathe out for 8 seconds</p>
        <p className="pt-2 text-[var(--text-muted)]">Complete 8 cycles for deep relaxation</p>
      </div>
    </div>
  );
}

// ─── Main Games Showcase ───────────────────────────────────────────────────────

interface GamesComponentProps {
  selectedGame?: string;
}

export default function GamesComponent({ selectedGame: initialGame }: GamesComponentProps) {
  const [selectedGame, setSelectedGame] = useState<MiniGame | null>(
    initialGame ? MINI_GAMES.find((g) => g.id === initialGame) || null : null
  );
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [category, setCategory] = useState<string>("all");
  const [gameScores, setGameScores] = useState<Record<string, number>>({});

  const filteredGames = category === "all" 
    ? MINI_GAMES 
    : MINI_GAMES.filter((g) => g.category === category);

  const handleGameComplete = (gameId: string, score: number) => {
    setGameScores((prev) => ({
      ...prev,
      [gameId]: Math.max(prev[gameId] || 0, score),
    }));
  };

  if (selectedGame) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">{selectedGame.name}</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{selectedGame.description}</p>
          </div>
          <button
            onClick={() => setSelectedGame(null)}
            className="px-4 py-2 rounded-lg bg-[var(--surface-raised)] text-[var(--text)] hover:bg-[var(--surface)] transition"
          >
            ← Back to Games
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            {selectedGame.id === "bubble-pop" && (
              <BubblePopGame onComplete={(score) => handleGameComplete(selectedGame.id, score)} />
            )}
            {selectedGame.id === "memory-match" && (
              <MemoryMatchGame onComplete={(score) => handleGameComplete(selectedGame.id, score)} />
            )}
            {selectedGame.id === "breathing-guide" && (
              <BreathingGuideGame onComplete={() => handleGameComplete(selectedGame.id, 1)} />
            )}
            {!["bubble-pop", "memory-match", "breathing-guide"].includes(selectedGame.id) && (
              <div className="p-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-center h-96">
                <div>
                  <div className="text-5xl mb-4">{selectedGame.emoji}</div>
                  <p className="text-[var(--text-secondary)]">Coming Soon</p>
                  <p className="text-xs text-[var(--text-muted)] mt-2">{selectedGame.description}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className={`rounded-lg border p-4 space-y-3 ${selectedGame.color}`}>
              <h3 className="font-semibold text-[var(--text)]">Game Info</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-[var(--text-muted)]">Difficulty</p>
                  <p className="font-medium text-[var(--text)]">{selectedGame.difficulty}</p>
                </div>
                <div>
                  <p className="text-[var(--text-muted)]">Duration</p>
                  <p className="font-medium text-[var(--text)]">{selectedGame.duration}</p>
                </div>
                <div>
                  <p className="text-[var(--text-muted)]">Benefits</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedGame.targetBenefits.map((b) => (
                      <span key={b} className="px-2 py-1 rounded text-xs bg-white/10 border border-white/20">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
              <h3 className="font-semibold text-[var(--text)]">How to Play</h3>
              <ol className="text-xs text-[var(--text-secondary)] space-y-2">
                {selectedGame.instructions.map((instruction, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-bold text-[var(--accent)]">{i + 1}.</span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            {gameScores[selectedGame.id] && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                <p className="text-xs text-green-400">Best Score</p>
                <p className="text-2xl font-bold text-green-400 mt-1">{gameScores[selectedGame.id]}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text)]">Mental Health Games</h1>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-lg bg-[var(--surface-raised)] text-[var(--text)] hover:bg-[var(--surface)] transition"
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { id: "all", name: "All Games", emoji: "🎮" },
          ...GAME_CATEGORIES,
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              category === cat.id
                ? "bg-[var(--accent)] text-[var(--text)]"
                : "bg-[var(--surface-raised)] text-[var(--text)] hover:bg-[var(--surface)]"
            }`}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredGames.map((game) => (
            <motion.button
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={() => setSelectedGame(game)}
              className={`rounded-lg border p-5 space-y-3 text-left hover:shadow-lg transition-all group ${game.color}`}
            >
              <div className="flex items-start justify-between">
                <div className="text-3xl">{game.emoji}</div>
                {gameScores[game.id] && (
                  <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                    {gameScores[game.id]}
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition">
                  {game.name}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                  {game.description}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <span className="px-2 py-1 rounded-full text-[10px] bg-white/10 border border-white/20 text-[var(--text-muted)]">
                  {game.duration}
                </span>
                <span className="px-2 py-1 rounded-full text-[10px] bg-white/10 border border-white/20 text-[var(--text-muted)]">
                  {game.difficulty}
                </span>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
