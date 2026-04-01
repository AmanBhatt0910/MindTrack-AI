"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  Music,
  Gamepad2,
  Clock,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { MentalState } from "@/features/posts/types/post.types";
import {
  getGamesForPrediction,
  getMusicForPrediction,
  RelaxationGame,
  MusicTrack,
  GameDifficulty,
} from "../services/relaxationGames";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DIFFICULTY_COLORS: Record<GameDifficulty, string> = {
  easy: "bg-green-500/10 text-green-400 border-green-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  hard: "bg-red-500/10 text-red-400 border-red-500/20",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function GameCard({ game }: { game: RelaxationGame }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-[var(--radius-lg)] border bg-gradient-to-br p-5 space-y-3 ${game.color}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{game.emoji}</span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-[var(--text)] leading-tight">
            {game.name}
          </h4>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
              <Clock size={10} />
              {game.duration}
            </span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${DIFFICULTY_COLORS[game.difficulty]}`}
            >
              {game.difficulty}
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        {game.description}
      </p>

      {/* Benefits */}
      <div className="flex flex-wrap gap-1">
        {game.benefits.map((b) => (
          <span
            key={b}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-white/5 border border-white/10 text-[var(--text-muted)]"
          >
            <CheckCircle2 size={9} className="text-green-400" />
            {b}
          </span>
        ))}
      </div>

      {/* Instructions toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium
                   bg-white/5 hover:bg-white/10 text-[var(--accent)] transition-all"
      >
        <Zap size={11} />
        {open ? "Hide Instructions" : "How to Play"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.ol
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1.5 overflow-hidden pl-1"
          >
            {game.instructions.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                <span className="shrink-0 size-4 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-[var(--accent)] mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </motion.ol>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MusicCard({ track }: { track: MusicTrack }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-[var(--radius-lg)] border bg-gradient-to-br p-5 space-y-3 ${track.color}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{track.coverEmoji}</span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-[var(--text)] truncate">
            {track.title}
          </h4>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
            {track.artist}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/5 border border-white/10 text-[var(--text-muted)]">
              {track.genre}
            </span>
            {track.bpm > 0 && (
              <span className="text-[11px] text-[var(--text-muted)]">
                {track.bpm} BPM
              </span>
            )}
            <span className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
              <Clock size={10} />
              {track.duration}
            </span>
          </div>
        </div>
      </div>

      {/* Mood tags */}
      <div className="flex flex-wrap gap-1">
        {track.moodTags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 border border-white/10 text-[var(--text-muted)]"
          >
            #{tag}
          </span>
        ))}
      </div>

      <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic">
        {track.reasoning}
      </p>

      {/* Streaming links */}
      <div className="flex items-center gap-2 flex-wrap">
        <a
          href={track.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] text-xs
                     bg-green-500/10 text-green-400 border border-green-500/20
                     hover:bg-green-500/20 transition-all"
        >
          <ExternalLink size={10} />
          Spotify
        </a>
        <a
          href={track.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] text-xs
                     bg-red-500/10 text-red-400 border border-red-500/20
                     hover:bg-red-500/20 transition-all"
        >
          <ExternalLink size={10} />
          YouTube
        </a>
        {track.soundcloudUrl && (
          <a
            href={track.soundcloudUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] text-xs
                       bg-orange-500/10 text-orange-400 border border-orange-500/20
                       hover:bg-orange-500/20 transition-all"
          >
            <ExternalLink size={10} />
            SoundCloud
          </a>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

interface GamesAndMusicPanelProps {
  prediction: MentalState;
}

type ActiveTab = "games" | "music";

export default function GamesAndMusicPanel({
  prediction,
}: GamesAndMusicPanelProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("games");

  const games = getGamesForPrediction(prediction);
  const tracks = getMusicForPrediction(prediction);

  return (
    <section className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <div className="size-1.5 rounded-full bg-[var(--accent)] pulse-dot" aria-hidden />
        <h2 className="text-sm font-semibold text-[var(--text)] tracking-[-0.01em]">
          Relaxation & Recommendations
        </h2>
        <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-muted)]">
          For {prediction}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 w-fit rounded-[var(--radius-md)] bg-[var(--surface-raised)] border border-[var(--border)]">
        <button
          onClick={() => setActiveTab("games")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium transition-all
            ${activeTab === "games"
              ? "bg-[var(--surface)] text-[var(--text)] shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
        >
          <Gamepad2 size={13} />
          Relaxation Games
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[var(--surface-raised)] border border-[var(--border)]">
            {games.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("music")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium transition-all
            ${activeTab === "music"
              ? "bg-[var(--surface)] text-[var(--text)] shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
        >
          <Music size={13} />
          Music
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[var(--surface-raised)] border border-[var(--border)]">
            {tracks.length}
          </span>
        </button>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === "games" ? (
          <motion.div
            key="games"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="music"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {tracks.map((track) => (
              <MusicCard key={track.id} track={track} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
