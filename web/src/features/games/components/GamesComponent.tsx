"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, ArrowLeft, Info, Trophy } from "lucide-react";
import { MINI_GAMES, GAME_CATEGORIES } from "@/features/games/services/games.service";
import { MiniGame } from "@/features/games/types/games.types";
import { SoundEffects } from "@/features/games/utils/soundEffects";
import { useGamingStore } from "@/features/games/store/useGamingStore";

// Components
import GamingDashboard from "./GamingDashboard";
import VictoryModal from "./VictoryModal";

// Games
import BubblePopGame from "./games/BubblePopGame";
import MemoryMatchGame from "./games/MemoryMatchGame";
import BreathingGuideGame from "./games/BreathingGuideGame";
import ColorSequenceGame from "./games/ColorSequenceGame";
import TapFlowGame from "./games/TapFlowGame";

// Hub Sections
import AchievementsList from "./AchievementsList";
import DailyChallenges from "./DailyChallenges";
import Leaderboard from "./Leaderboard";

interface GamesComponentProps {
  selectedGame?: string;
}

export default function GamesComponent({ selectedGame: initialGame }: GamesComponentProps) {
  const [selectedGame, setSelectedGame] = useState<MiniGame | null>(
    initialGame ? MINI_GAMES.find((g) => g.id === initialGame) || null : null
  );
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [category, setCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"games" | "challenges" | "leaderboard" | "achievements">("games");
  const [mounted, setMounted] = useState(false);

  // Rewards State
  const { addXP, addCoins } = useGamingStore();
  const [victoryModalOpen, setVictoryModalOpen] = useState(false);
  const [lastReward, setLastReward] = useState({ score: 0, xp: 0, coins: 0 });

  useEffect(() => {
    setMounted(true);
    setSoundEnabled(SoundEffects.isSoundEnabled());
  }, []);

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    SoundEffects.setSoundEnabled(newState);
  };

  const handleGameComplete = (gameId: string, score: number) => {
    // Basic reward calculation
    const xpEarned = Math.floor(score * 2.5) + 50; // Base 50 + score bonus
    const coinsEarned = Math.floor(score / 2) + 10;

    addXP(xpEarned);
    addCoins(coinsEarned);

    setLastReward({ score, xp: xpEarned, coins: coinsEarned });
    setVictoryModalOpen(true);
  };

  const filteredGames = category === "all" 
    ? MINI_GAMES 
    : MINI_GAMES.filter((g) => g.category === category);

  if (!mounted) return null;

  if (selectedGame) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        <VictoryModal
          isOpen={victoryModalOpen}
          gameName={selectedGame.name}
          score={lastReward.score}
          xpEarned={lastReward.xp}
          coinsEarned={lastReward.coins}
          onClose={() => {
            setVictoryModalOpen(false);
            setSelectedGame(null); // Return to hub
          }}
        />

        {/* Top Navigation */}
        <div className="flex items-center justify-between bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border)] shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedGame(null)}
              className="p-2 rounded-xl bg-[var(--surface-raised)] hover:bg-[var(--border)] transition-colors text-[var(--text)]"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2">
                {selectedGame.emoji} {selectedGame.name}
              </h1>
              <p className="text-xs text-[var(--text-muted)] hidden sm:block">{selectedGame.description}</p>
            </div>
          </div>
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl transition-colors ${
              soundEnabled ? "bg-indigo-500/10 text-indigo-500" : "bg-[var(--surface-raised)] text-[var(--text-muted)]"
            }`}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--surface)] p-6 rounded-3xl border border-[var(--border)] shadow-md min-h-[500px]">
              {selectedGame.id === "bubble-pop" && (
                <BubblePopGame onComplete={(score) => handleGameComplete(selectedGame.id, score)} />
              )}
              {selectedGame.id === "memory-match" && (
                <MemoryMatchGame onComplete={(score) => handleGameComplete(selectedGame.id, score)} />
              )}
              {selectedGame.id === "breathing-guide" && (
                <BreathingGuideGame onComplete={(score) => handleGameComplete(selectedGame.id, score)} />
              )}
              {selectedGame.id === "color-sequence" && (
                <ColorSequenceGame onComplete={(score) => handleGameComplete(selectedGame.id, score)} />
              )}
              {selectedGame.id === "tap-flow" && (
                <TapFlowGame onComplete={(score) => handleGameComplete(selectedGame.id, score)} />
              )}
              
              {/* Fallback for unimplemented games */}
              {!["bubble-pop", "memory-match", "breathing-guide", "color-sequence", "tap-flow"].includes(selectedGame.id) && (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-[var(--surface-raised)] to-[var(--surface)] rounded-2xl border border-[var(--border)]">
                  <div className="text-6xl mb-6 animate-bounce">{selectedGame.emoji}</div>
                  <h3 className="text-2xl font-bold text-[var(--text)] mb-2">Coming Soon</h3>
                  <p className="text-[var(--text-muted)] max-w-md">
                    We are currently building this premium experience. Check back soon for {selectedGame.name}!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            <div className={`rounded-3xl p-6 bg-gradient-to-br ${selectedGame.color} border shadow-sm`}>
              <div className="flex items-center gap-2 mb-4">
                <Info size={18} className="opacity-70" />
                <h3 className="font-bold text-[var(--text)]">Benefits</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedGame.targetBenefits.map((b) => (
                  <span key={b} className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/20 border border-white/30 backdrop-blur-sm">
                    {b}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-[var(--surface)] rounded-3xl p-6 border border-[var(--border)] shadow-sm">
              <h3 className="font-bold text-[var(--text)] mb-4">How to Play</h3>
              <ol className="space-y-3">
                {selectedGame.instructions.map((instruction, i) => (
                  <li key={i} className="flex gap-3 text-sm text-[var(--text-secondary)]">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--surface-raised)] flex items-center justify-center font-bold text-[var(--text)] text-xs">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text)] tracking-tight">Wellness Gaming Hub</h1>
          <p className="text-[var(--text-muted)] mt-1">Play, relax, and earn rewards while improving your mental health.</p>
        </div>
        <button
          onClick={toggleSound}
          className={`self-start md:self-auto flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
            soundEnabled 
              ? "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20" 
              : "bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] hover:bg-[var(--surface-raised)]"
          }`}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          {soundEnabled ? "Sound On" : "Sound Off"}
        </button>
      </div>

      <GamingDashboard />

      {/* Tabs */}
      <div className="flex bg-[var(--surface)] p-1 rounded-2xl border border-[var(--border)] overflow-x-auto scrollbar-hide">
        {[
          { id: "games", name: "Play Games", icon: "🎮" },
          { id: "challenges", name: "Daily Quests", icon: "🎯" },
          { id: "leaderboard", name: "Rankings", icon: "🏆" },
          { id: "achievements", name: "Badges", icon: "🏅" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md transform scale-[1.02]" 
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      <div className="mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "challenges" && <DailyChallenges />}
            {activeTab === "leaderboard" && <Leaderboard />}
            {activeTab === "achievements" && <AchievementsList />}
            
            {activeTab === "games" && (
              <div className="space-y-6">
                {/* Category Filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {[
                    { id: "all", name: "All Games", emoji: "🎮" },
                    ...GAME_CATEGORIES,
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                        category === cat.id
                          ? "bg-[var(--text)] text-[var(--surface)] shadow-md transform scale-105"
                          : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]"
                      }`}
                    >
                      <span className="text-lg">{cat.emoji}</span>
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Games Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <AnimatePresence mode="popLayout">
                    {filteredGames.map((game, index) => (
                      <motion.div
                        key={game.id}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <button
                          onClick={() => setSelectedGame(game)}
                          className={`w-full h-full text-left bg-gradient-to-br ${game.color} rounded-3xl p-1 relative group overflow-hidden hover:shadow-xl hover:shadow-${game.color.split('-')[1]}-500/20 transition-all duration-300 transform hover:-translate-y-1`}
                        >
                          <div className="absolute inset-0 bg-white/40 dark:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          
                          <div className="bg-[var(--surface)]/80 backdrop-blur-md rounded-[22px] h-full p-5 border border-white/10 flex flex-col relative z-10">
                            <div className="flex items-start justify-between mb-4">
                              <div className="w-14 h-14 rounded-2xl bg-white/50 dark:bg-black/30 flex items-center justify-center text-3xl shadow-sm">
                                {game.emoji}
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]">
                                  {game.difficulty}
                                </span>
                              </div>
                            </div>

                            <h3 className="text-xl font-bold text-[var(--text)] mb-2 group-hover:text-indigo-500 transition-colors">
                              {game.name}
                            </h3>
                            
                            <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4 flex-grow">
                              {game.description}
                            </p>

                            <div className="flex items-center gap-3 mt-auto pt-4 border-t border-[var(--border)]">
                              <div className="flex items-center text-xs text-[var(--text-muted)] font-medium bg-[var(--surface-raised)] px-2 py-1 rounded">
                                ⏱️ {game.duration}
                              </div>
                              {["bubble-pop", "memory-match", "breathing-guide", "color-sequence", "tap-flow"].includes(game.id) ? null : (
                                <div className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded ml-auto">
                                  Coming Soon
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
