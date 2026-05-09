import { motion, AnimatePresence } from "framer-motion";
import { Star, Zap, Award } from "lucide-react";
import { useEffect } from "react";
import { SoundEffects } from "@/features/games/utils/soundEffects";

interface VictoryModalProps {
  isOpen: boolean;
  gameName: string;
  score: number;
  xpEarned: number;
  coinsEarned: number;
  onClose: () => void;
}

export default function VictoryModal({
  isOpen,
  gameName,
  score,
  xpEarned,
  coinsEarned,
  onClose,
}: VictoryModalProps) {
  useEffect(() => {
    if (isOpen) {
      SoundEffects.levelUp();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-xl mb-4"
              >
                <Award size={48} className="text-purple-600" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Level Complete!</h2>
              <p className="text-white/90 font-medium">{gameName}</p>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              <div className="flex justify-center">
                <div className="text-center">
                  <p className="text-sm text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-1">Score</p>
                  <p className="text-4xl font-bold text-[var(--text)]">{score}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex flex-col items-center justify-center"
                >
                  <Zap className="text-indigo-500 mb-2 fill-indigo-500" size={24} />
                  <span className="text-2xl font-bold text-indigo-500">+{xpEarned}</span>
                  <span className="text-xs text-indigo-500/80 font-medium">XP Earned</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex flex-col items-center justify-center"
                >
                  <Star className="text-yellow-500 mb-2 fill-yellow-500" size={24} />
                  <span className="text-2xl font-bold text-yellow-500">+{coinsEarned}</span>
                  <span className="text-xs text-yellow-500/80 font-medium">Coins</span>
                </motion.div>
              </div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                onClick={onClose}
                className="w-full py-4 rounded-xl bg-[var(--text)] text-[var(--surface)] font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                Continue
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
