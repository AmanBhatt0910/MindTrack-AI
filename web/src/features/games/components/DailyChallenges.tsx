import { motion } from "framer-motion";
import { Target, Gift, CheckCircle } from "lucide-react";
import { useGamingStore } from "@/features/games/store/useGamingStore";

const DAILY_CHALLENGES = [
  { id: "play_3_games", title: "Play 3 Games", description: "Complete any 3 games today", xpReward: 150, coinReward: 20, icon: "🎮" },
  { id: "score_bubble", title: "Bubble Master", description: "Score over 15 in Bubble Pop", xpReward: 200, coinReward: 30, icon: "🫧" },
  { id: "meditate", title: "Deep Breaths", description: "Complete a Breathing Guide session", xpReward: 100, coinReward: 15, icon: "🌬️" },
];

export default function DailyChallenges() {
  const { completedChallenges } = useGamingStore();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <Target size={120} />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Daily Challenges</h2>
          <p className="text-blue-100 max-w-md">
            Complete these challenges every day to earn extra XP and Mind Coins. Challenges reset at midnight.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DAILY_CHALLENGES.map((challenge, i) => {
          const isCompleted = completedChallenges.includes(challenge.id);
          
          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 rounded-3xl border relative overflow-hidden ${
                isCompleted 
                  ? "bg-green-500/10 border-green-500/30" 
                  : "bg-[var(--surface)] border-[var(--border)] hover:border-indigo-500/30 hover:shadow-md transition-all"
              }`}
            >
              {isCompleted && (
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/20 rounded-full blur-2xl"></div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div className="text-4xl bg-[var(--surface-raised)] w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm">
                  {challenge.icon}
                </div>
                {isCompleted ? (
                  <CheckCircle className="text-green-500" size={28} />
                ) : (
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-full">+{challenge.xpReward} XP</span>
                    <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full">+{challenge.coinReward} Coins</span>
                  </div>
                )}
              </div>
              
              <h3 className={`text-xl font-bold mb-1 ${isCompleted ? "text-green-600 dark:text-green-400" : "text-[var(--text)]"}`}>
                {challenge.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {challenge.description}
              </p>
              
              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <button 
                  disabled={isCompleted}
                  className={`w-full py-2.5 rounded-xl font-bold transition-all ${
                    isCompleted 
                      ? "bg-green-500/20 text-green-600 dark:text-green-400 cursor-not-allowed" 
                      : "bg-indigo-500 text-white hover:bg-indigo-600 active:scale-95"
                  }`}
                >
                  {isCompleted ? "Completed" : "Play Now"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
