import { motion } from "framer-motion";
import { Trophy, Lock, CheckCircle2 } from "lucide-react";
import { useGamingStore } from "@/features/games/store/useGamingStore";
import { GAME_ACHIEVEMENTS } from "@/features/games/services/games.service";

export default function AchievementsList() {
  const { unlockedAchievements } = useGamingStore();

  const total = GAME_ACHIEVEMENTS.length;
  const unlocked = unlockedAchievements.length;
  const progress = (unlocked / total) * 100;

  return (
    <div className="space-y-6">
      <div className="bg-[var(--surface)] p-6 rounded-3xl border border-[var(--border)] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[var(--text)] flex items-center gap-2">
            <Trophy className="text-yellow-500" />
            Your Achievements
          </h2>
          <span className="font-bold text-[var(--text-muted)]">
            {unlocked} / {total}
          </span>
        </div>
        
        <div className="h-4 w-full bg-[var(--surface-raised)] rounded-full overflow-hidden border border-[var(--border)]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1 }}
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {GAME_ACHIEVEMENTS.map((achievement, i) => {
          const isUnlocked = unlockedAchievements.includes(achievement.id);
          
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-5 rounded-2xl border transition-all ${
                isUnlocked 
                  ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border-yellow-500/30" 
                  : "bg-[var(--surface)] border-[var(--border)] opacity-60 grayscale"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm ${
                  isUnlocked ? "bg-white/50" : "bg-[var(--surface-raised)]"
                }`}>
                  {isUnlocked ? achievement.icon : <Lock size={20} className="text-[var(--text-muted)]" />}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold ${isUnlocked ? "text-yellow-600 dark:text-yellow-500" : "text-[var(--text-muted)]"}`}>
                    {achievement.name}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{achievement.description}</p>
                </div>
                {isUnlocked && (
                  <CheckCircle2 size={20} className="text-green-500" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
