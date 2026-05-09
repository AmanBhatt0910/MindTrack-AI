"use client";

import { MiniGame } from "../types/games.types";

// ─── Game Definitions ──────────────────────────────────────────────────────────

export const MINI_GAMES: MiniGame[] = [
  {
    id: "bubble-pop",
    name: "Bubble Pop",
    emoji: "🫧",
    icon: "bubble",
    description: "Pop bubbles to release stress and anxiety. A satisfying and meditative experience.",
    category: "relaxation",
    difficulty: "easy",
    duration: "5 min",
    durationSeconds: 300,
    targetBenefits: ["Stress Relief", "Anxiety Reduction", "Mindfulness"],
    instructions: [
      "Tap or click on bubbles as they appear",
      "Each bubble you pop releases a stressful thought",
      "Try to pop at least 20 bubbles",
      "Focus on the calming sound and animation",
      "Take deep breaths between taps"
    ],
    color: "from-blue-500/20 to-blue-500/5 border-blue-500/20",
    audio: {
      backgroundMusic: "/sounds/bubble-ambient.mp3",
      soundEffects: {
        click: "/sounds/bubble-pop.mp3",
        success: "/sounds/bubble-success.mp3",
      }
    }
  },
  {
    id: "memory-match",
    name: "Memory Match",
    emoji: "🎮",
    icon: "game",
    description: "Match pairs of cards to improve concentration and memory. A classic brain training game.",
    category: "memory",
    difficulty: "medium",
    duration: "10 min",
    durationSeconds: 600,
    targetBenefits: ["Memory Improvement", "Focus", "Cognitive Function"],
    instructions: [
      "Click on cards to reveal hidden images",
      "Try to find matching pairs",
      "Match all pairs in the minimum number of moves",
      "Challenge yourself to beat your previous score",
      "Timer increases difficulty as rounds progress"
    ],
    color: "from-purple-500/20 to-purple-500/5 border-purple-500/20",
    audio: {
      backgroundMusic: "/sounds/memory-ambient.mp3",
      soundEffects: {
        click: "/sounds/card-flip.mp3",
        success: "/sounds/match-success.mp3",
      }
    }
  },
  {
    id: "breathing-guide",
    name: "Guided Breathing",
    emoji: "🌬️",
    icon: "wind",
    description: "Follow an animated breathing pattern to calm your mind and reduce anxiety.",
    category: "breathing",
    difficulty: "easy",
    duration: "5 min",
    durationSeconds: 300,
    targetBenefits: ["Anxiety Reduction", "Calm", "Parasympathetic Activation"],
    instructions: [
      "Watch the circle as it expands and contracts",
      "Inhale as the circle expands (4 seconds)",
      "Hold your breath as it pauses (4 seconds)",
      "Exhale as it contracts (8 seconds)",
      "Complete 5-8 cycles for best results"
    ],
    color: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/20",
    audio: {
      backgroundMusic: "/sounds/breathing-ambient.mp3",
    }
  },
  {
    id: "color-sequence",
    name: "Color Sequence",
    emoji: "🎨",
    icon: "palette",
    description: "Follow an increasingly complex color sequence. Improves focus and reaction time.",
    category: "focus",
    difficulty: "hard",
    duration: "8 min",
    durationSeconds: 480,
    targetBenefits: ["Focus", "Reaction Time", "Pattern Recognition"],
    instructions: [
      "Watch colors light up in a sequence",
      "Repeat the sequence by clicking colored buttons",
      "Each correct sequence gets longer",
      "Reach level 10 for a high score",
      "Try to beat your personal best"
    ],
    color: "from-pink-500/20 to-pink-500/5 border-pink-500/20",
    audio: {
      soundEffects: {
        click: "/sounds/color-click.mp3",
        success: "/sounds/level-up.mp3",
        failure: "/sounds/wrong-sequence.mp3",
      }
    }
  },
  {
    id: "zen-puzzle",
    name: "Zen Puzzle",
    emoji: "🧩",
    icon: "puzzle",
    description: "Solve sliding puzzles with beautiful imagery. A meditative puzzle experience.",
    category: "puzzle",
    difficulty: "medium",
    duration: "10 min",
    durationSeconds: 600,
    targetBenefits: ["Problem Solving", "Patience", "Mindfulness"],
    instructions: [
      "Slide tiles to complete the beautiful image",
      "Each level has a time limit",
      "Think strategically about each move",
      "Enjoy the calming music while you play",
      "Complete all levels to unlock rewards"
    ],
    color: "from-green-500/20 to-green-500/5 border-green-500/20",
    audio: {
      backgroundMusic: "/sounds/puzzle-ambient.mp3",
      soundEffects: {
        click: "/sounds/puzzle-slide.mp3",
        success: "/sounds/puzzle-complete.mp3",
      }
    }
  },
  {
    id: "body-scan",
    name: "Body Scan Meditation",
    emoji: "🧘",
    icon: "meditation",
    description: "Guided body scan meditation to release tension and promote relaxation.",
    category: "mindfulness",
    difficulty: "easy",
    duration: "12 min",
    durationSeconds: 720,
    targetBenefits: ["Tension Release", "Body Awareness", "Relaxation"],
    instructions: [
      "Get comfortable in a quiet space",
      "Follow the on-screen guidance",
      "Breathe deeply and focus on each body part",
      "Release tension as you go",
      "Complete the full session for best results"
    ],
    color: "from-orange-500/20 to-orange-500/5 border-orange-500/20",
    audio: {
      backgroundMusic: "/sounds/meditation-ambient.mp3",
    }
  },
  {
    id: "tap-flow",
    name: "Tap Flow",
    emoji: "⏱️",
    icon: "tap",
    description: "Tap to the rhythm of relaxing music. Combines rhythm and relaxation.",
    category: "relaxation",
    difficulty: "easy",
    duration: "6 min",
    durationSeconds: 360,
    targetBenefits: ["Rhythm Coordination", "Stress Relief", "Enjoyment"],
    instructions: [
      "Listen to the calm music",
      "Tap when you feel the beat",
      "Keep a steady rhythm",
      "Accuracy increases your score",
      "Enjoy the meditative experience"
    ],
    color: "from-indigo-500/20 to-indigo-500/5 border-indigo-500/20",
    audio: {
      backgroundMusic: "/sounds/tap-flow-music.mp3",
      soundEffects: {
        click: "/sounds/tap-success.mp3",
      }
    }
  },
  {
    id: "mandala-draw",
    name: "Mandala Drawing",
    emoji: "🎯",
    icon: "mandala",
    description: "Create beautiful mandalas by filling in colors. Art therapy meets meditation.",
    category: "mindfulness",
    difficulty: "easy",
    duration: "15 min",
    durationSeconds: 900,
    targetBenefits: ["Creativity", "Mindfulness", "Stress Reduction"],
    instructions: [
      "Click on sections of the mandala",
      "Choose colors to fill each area",
      "Create your unique artistic expression",
      "Share your creation when complete",
      "Save your favorite mandalas"
    ],
    color: "from-rose-500/20 to-rose-500/5 border-rose-500/20",
    audio: {
      backgroundMusic: "/sounds/art-ambient.mp3",
      soundEffects: {
        click: "/sounds/color-fill.mp3",
        success: "/sounds/art-complete.mp3",
      }
    }
  },
  {
    id: "word-calm",
    name: "Word Calm",
    emoji: "📝",
    icon: "words",
    description: "Find calming words in a letter grid. Combines puzzle elements with mindfulness.",
    category: "focus",
    difficulty: "medium",
    duration: "8 min",
    durationSeconds: 480,
    targetBenefits: ["Attention", "Vocabulary", "Mindfulness"],
    instructions: [
      "Find calming words hidden in the grid",
      "Words can be horizontal, vertical, or diagonal",
      "Each word you find brings calm",
      "Unlock increasingly difficult levels",
      "Compete on the global leaderboard"
    ],
    color: "from-lime-500/20 to-lime-500/5 border-lime-500/20",
    audio: {
      soundEffects: {
        click: "/sounds/word-select.mp3",
        success: "/sounds/word-found.mp3",
      }
    }
  },
];

// ─── Helper Functions ──────────────────────────────────────────────────────────

export function getGameById(gameId: string): MiniGame | undefined {
  return MINI_GAMES.find((game) => game.id === gameId);
}

export function getGamesByCategory(category: string): MiniGame[] {
  return MINI_GAMES.filter((game) => game.category === category);
}

export function getGamesByDifficulty(difficulty: string): MiniGame[] {
  return MINI_GAMES.filter((game) => game.difficulty === difficulty);
}

export function getGamesByBenefit(benefit: string): MiniGame[] {
  return MINI_GAMES.filter((game) => game.targetBenefits.includes(benefit));
}

export const GAME_CATEGORIES = [
  { id: "breathing", name: "Breathing", emoji: "🌬️" },
  { id: "memory", name: "Memory", emoji: "🎮" },
  { id: "puzzle", name: "Puzzles", emoji: "🧩" },
  { id: "relaxation", name: "Relaxation", emoji: "😌" },
  { id: "focus", name: "Focus", emoji: "👁️" },
  { id: "mindfulness", name: "Mindfulness", emoji: "🧘" },
] as const;

export const GAME_ACHIEVEMENTS = [
  {
    id: "first-bubble",
    name: "Bubble Buster",
    description: "Pop your first bubble",
    icon: "🫧",
  },
  {
    id: "memory-master",
    name: "Memory Master",
    description: "Match all pairs without mistakes",
    icon: "🎮",
  },
  {
    id: "calm-breather",
    name: "Calm Breather",
    description: "Complete 3 breathing sessions",
    icon: "🌬️",
  },
  {
    id: "puzzle-pro",
    name: "Puzzle Pro",
    description: "Solve 5 puzzles",
    icon: "🧩",
  },
  {
    id: "daily-player",
    name: "Daily Player",
    description: "Play games for 7 consecutive days",
    icon: "🎯",
  },
  {
    id: "game-enthusiast",
    name: "Game Enthusiast",
    description: "Play 50 games total",
    icon: "🏆",
  },
] as const;
