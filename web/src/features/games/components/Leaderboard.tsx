import { motion } from "framer-motion";
import { Users, Medal } from "lucide-react";
import { useGamingStore } from "@/features/games/store/useGamingStore";

// Mock data for leaderboard
const LEADERBOARD_DATA = [
  { id: 1, name: "Sarah J.", level: 42, score: 24500, avatar: "👩" },
  { id: 2, name: "Mike T.", level: 38, score: 21200, avatar: "👨" },
  { id: 3, name: "Alex W.", level: 35, score: 19800, avatar: "🧑" },
  { id: 4, name: "Emma R.", level: 31, score: 17500, avatar: "👱‍♀️" },
  { id: 5, name: "David L.", level: 29, score: 15400, avatar: "🧔" },
  { id: 6, name: "You", level: 1, score: 0, avatar: "👤", isUser: true },
];

export default function Leaderboard() {
  const { level, xp } = useGamingStore();
  
  // Update mock data with actual user stats
  const data = [...LEADERBOARD_DATA];
  const userIdx = data.findIndex(u => u.isUser);
  if (userIdx !== -1) {
    data[userIdx].level = level;
    data[userIdx].score = xp;
  }
  
  // Re-sort
  data.sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
            <Users className="text-indigo-500" />
            Global Rankings
          </h2>
          <p className="text-[var(--text-muted)]">Compete with others in your wellness journey.</p>
        </div>
        <div className="bg-[var(--surface-raised)] px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-medium">
          Season ends in 5 days
        </div>
      </div>

      <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 bg-[var(--surface-raised)] border-b border-[var(--border)] text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-6">Player</div>
          <div className="col-span-2 text-center">Level</div>
          <div className="col-span-2 text-right pr-4">Score (XP)</div>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {data.map((player, index) => {
            const rank = index + 1;
            let rankStyle = "text-[var(--text-muted)]";
            let rowStyle = player.isUser ? "bg-indigo-500/5" : "hover:bg-[var(--surface-raised)]/50 transition-colors";
            
            if (rank === 1) rankStyle = "text-yellow-500 bg-yellow-500/10";
            if (rank === 2) rankStyle = "text-slate-400 bg-slate-400/10";
            if (rank === 3) rankStyle = "text-amber-700 bg-amber-700/10 dark:text-amber-600 dark:bg-amber-600/10";

            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`grid grid-cols-12 gap-4 p-4 items-center ${rowStyle}`}
              >
                <div className="col-span-2 flex justify-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${rankStyle}`}>
                    {rank <= 3 ? <Medal size={16} /> : rank}
                  </div>
                </div>
                
                <div className="col-span-6 flex items-center gap-3">
                  <div className="text-2xl bg-[var(--surface-raised)] w-10 h-10 rounded-full flex items-center justify-center border border-[var(--border)]">
                    {player.avatar}
                  </div>
                  <div>
                    <span className={`font-bold ${player.isUser ? "text-indigo-600 dark:text-indigo-400" : "text-[var(--text)]"}`}>
                      {player.name}
                    </span>
                    {player.isUser && <span className="ml-2 text-[10px] uppercase tracking-wider bg-indigo-500 text-white px-1.5 py-0.5 rounded">You</span>}
                  </div>
                </div>

                <div className="col-span-2 text-center font-bold text-[var(--text-secondary)]">
                  {player.level}
                </div>

                <div className="col-span-2 text-right pr-4 font-mono font-bold text-[var(--text)]">
                  {player.score.toLocaleString()}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
