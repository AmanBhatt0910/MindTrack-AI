import { motion } from "framer-motion";
import { Award, Flame, Star, Trophy } from "lucide-react";
import { useGamingStore } from "@/features/games/store/useGamingStore";
import { useEffect, useState } from "react";

export default function GamingDashboard() {
  const { xp, level, coins, currentStreak, checkDailyLogin } = useGamingStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setMounted(true);
    checkDailyLogin();
  }, [checkDailyLogin]);

  if (!mounted) return null;

  const xpNeededForNextLevel = 1000;
  const currentLevelXp = xp % xpNeededForNextLevel;
  const progressPercentage = (currentLevelXp / xpNeededForNextLevel) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {/* Level & XP */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="md:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-[var(--surface)] to-[var(--surface-raised)] border border-[var(--border)] shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Trophy size={100} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-500/30">
              {level}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text)]">Level {level}</h2>
              <p className="text-sm text-[var(--text-muted)]">Mental Wellness Explorer</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-[var(--text)]">{currentLevelXp} XP</span>
              <span className="text-[var(--text-muted)]">{xpNeededForNextLevel} XP to Next Level</span>
            </div>
            <div className="h-3 w-full bg-[var(--surface-raised)] rounded-full overflow-hidden border border-[var(--border)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Streak */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 shadow-sm flex flex-col justify-center items-center text-center"
      >
        <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mb-3 text-orange-500">
          <Flame size={24} className={currentStreak > 0 ? "fill-orange-500" : ""} />
        </div>
        <div className="text-3xl font-bold text-orange-500 mb-1">{currentStreak}</div>
        <div className="text-sm text-orange-600/80 font-medium">Day Streak</div>
      </motion.div>

      {/* Coins */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20 shadow-sm flex flex-col justify-center items-center text-center"
      >
        <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mb-3 text-yellow-500">
          <Star size={24} className="fill-yellow-500" />
        </div>
        <div className="text-3xl font-bold text-yellow-500 mb-1">{coins}</div>
        <div className="text-sm text-yellow-600/80 font-medium">Mind Coins</div>
      </motion.div>
    </div>
  );
}
