import { MentalState } from "@/features/posts/types/post.types";

export type GameDifficulty = "easy" | "medium" | "hard";

export interface RelaxationGame {
  id: string;
  name: string;
  emoji: string;
  description: string;
  instructions: string[];
  duration: string; // e.g. "5 min"
  durationSeconds: number;
  difficulty: GameDifficulty;
  benefits: string[];
  targetConditions: MentalState[];
  color: string; // Tailwind gradient classes
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  bpm: number;
  duration: string; // e.g. "4:32"
  moodTags: string[];
  targetConditions: MentalState[];
  reasoning: string;
  spotifyUrl: string;
  youtubeUrl: string;
  soundcloudUrl?: string;
  coverEmoji: string;
  color: string;
}

// ─── Relaxation Games ─────────────────────────────────────────────────────────

export const RELAXATION_GAMES: RelaxationGame[] = [
  {
    id: "g1",
    name: "4-7-8 Breathing",
    emoji: "🌬️",
    description:
      "A proven breathing technique that activates your parasympathetic nervous system, reducing anxiety and promoting calm within minutes.",
    instructions: [
      "Sit comfortably with your back straight.",
      "Exhale completely through your mouth.",
      "Inhale quietly through your nose for 4 seconds.",
      "Hold your breath for 7 seconds.",
      "Exhale completely through your mouth for 8 seconds.",
      "Repeat the cycle 3–4 times.",
    ],
    duration: "5 min",
    durationSeconds: 300,
    difficulty: "easy",
    benefits: [
      "Reduces anxiety instantly",
      "Lowers heart rate",
      "Promotes sleep",
      "Calms nervous system",
    ],
    targetConditions: ["Anxiety", "Stress"],
    color: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/20",
  },
  {
    id: "g2",
    name: "Body Scan Meditation",
    emoji: "🧘",
    description:
      "A mindfulness practice that releases physical tension by directing focused attention through each part of your body.",
    instructions: [
      "Lie down or sit comfortably in a quiet space.",
      "Close your eyes and take three deep breaths.",
      "Start at your feet — notice any sensations without judgment.",
      "Slowly move attention upward: calves, thighs, hips, abdomen.",
      "Continue through chest, shoulders, arms, neck, and face.",
      "Breathe into any areas of tension, releasing them on the exhale.",
    ],
    duration: "10 min",
    durationSeconds: 600,
    difficulty: "medium",
    benefits: [
      "Releases muscle tension",
      "Improves body awareness",
      "Reduces stress hormones",
      "Deepens relaxation",
    ],
    targetConditions: ["Stress", "Anxiety"],
    color: "from-violet-500/20 to-violet-500/5 border-violet-500/20",
  },
  {
    id: "g3",
    name: "Mindful Walking",
    emoji: "🚶",
    description:
      "Turn an ordinary walk into a moving meditation. This grounding exercise reconnects you with the present moment.",
    instructions: [
      "Find a quiet space to walk (indoors or outdoors).",
      "Stand still and take three deep breaths.",
      "Begin walking at a slow, natural pace.",
      "Feel each footstep — heel, arch, toes.",
      "Notice sights, sounds, and sensations around you without judgment.",
      "If your mind wanders, gently return focus to each step.",
    ],
    duration: "15 min",
    durationSeconds: 900,
    difficulty: "easy",
    benefits: [
      "Breaks negative thought loops",
      "Boosts mood via movement",
      "Grounds you in the present",
      "Reduces rumination",
    ],
    targetConditions: ["Depression", "Anxiety"],
    color: "from-green-500/20 to-green-500/5 border-green-500/20",
  },
  {
    id: "g4",
    name: "Bubble Pop",
    emoji: "🫧",
    description:
      "An interactive tapping game where you pop virtual stress bubbles. Simple, satisfying, and surprisingly effective for stress relief.",
    instructions: [
      "Imagine or draw 10 bubbles on paper (or use your phone screen).",
      "Take a slow breath in.",
      "As you exhale, pop one bubble — tap it or mark it off.",
      "With each pop, release one stressful thought.",
      "Name the thought as you pop: 'I release this worry.'",
      "Continue until all 10 bubbles are popped.",
    ],
    duration: "3 min",
    durationSeconds: 180,
    difficulty: "easy",
    benefits: [
      "Provides instant stress relief",
      "Fun and engaging",
      "No equipment needed",
      "Reframes stressful thoughts",
    ],
    targetConditions: ["Stress", "Anxiety"],
    color: "from-blue-500/20 to-blue-500/5 border-blue-500/20",
  },
  {
    id: "g5",
    name: "Color Meditation",
    emoji: "🎨",
    description:
      "Use the calming power of color visualization to quiet racing thoughts and bring mental clarity.",
    instructions: [
      "Close your eyes and breathe slowly.",
      "Visualize a calming color — soft blue, gentle green, or warm gold.",
      "Picture this color as a warm light filling your mind.",
      "With each breath, let the color grow brighter and expand.",
      "See the color dissolve racing or anxious thoughts.",
      "Hold the visualization for 5 minutes, breathing steadily.",
    ],
    duration: "5 min",
    durationSeconds: 300,
    difficulty: "medium",
    benefits: [
      "Quiets racing thoughts",
      "Improves focus",
      "Reduces mental chatter",
      "Stimulates creativity",
    ],
    targetConditions: ["Anxiety", "Bipolar"],
    color: "from-pink-500/20 to-pink-500/5 border-pink-500/20",
  },
  {
    id: "g6",
    name: "Progressive Muscle Relaxation",
    emoji: "💪",
    description:
      "Systematically tense and release muscle groups to achieve deep physical and mental relaxation.",
    instructions: [
      "Lie down and close your eyes.",
      "Start with your feet — tense them tightly for 5 seconds.",
      "Release completely and notice the relaxation for 10 seconds.",
      "Move to your calves, thighs, abdomen, hands, arms, and face.",
      "Tense each group for 5 seconds, then release.",
      "Finish with a full-body scan, releasing any remaining tension.",
    ],
    duration: "15 min",
    durationSeconds: 900,
    difficulty: "easy",
    benefits: [
      "Reduces physical tension",
      "Improves sleep quality",
      "Lowers blood pressure",
      "Eases anxiety symptoms",
    ],
    targetConditions: ["Stress", "Depression"],
    color: "from-orange-500/20 to-orange-500/5 border-orange-500/20",
  },
];

// ─── Music Tracks ─────────────────────────────────────────────────────────────

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: "m1",
    title: "Clair de Lune",
    artist: "Claude Debussy",
    genre: "Classical",
    bpm: 60,
    duration: "5:08",
    moodTags: ["calm", "reflective", "peaceful"],
    targetConditions: ["Anxiety", "Stress"],
    reasoning:
      "Debussy's flowing arpeggios slow the heart rate and induce a deeply meditative state.",
    spotifyUrl: "https://open.spotify.com/track/1wxtSaDbvdAnz6T8D51bnP",
    youtubeUrl: "https://www.youtube.com/watch?v=CvFH_6DNRCY",
    coverEmoji: "🌙",
    color: "from-indigo-500/20 to-indigo-500/5 border-indigo-500/20",
  },
  {
    id: "m2",
    title: "Weightless",
    artist: "Marconi Union",
    genre: "Ambient",
    bpm: 60,
    duration: "8:10",
    moodTags: ["relaxing", "floating", "therapeutic"],
    targetConditions: ["Anxiety", "Stress", "Depression"],
    reasoning:
      "Widely studied for relaxation: gradually decreasing BPM may help synchronize with the heartbeat, supporting a calm state.",
    spotifyUrl: "https://open.spotify.com/track/4Hqb0Qb3baxIFZlEGjU7qi",
    youtubeUrl: "https://www.youtube.com/watch?v=UfcAVejslrU",
    coverEmoji: "☁️",
    color: "from-sky-500/20 to-sky-500/5 border-sky-500/20",
  },
  {
    id: "m3",
    title: "Gymnopédie No. 1",
    artist: "Erik Satie",
    genre: "Classical",
    bpm: 60,
    duration: "3:00",
    moodTags: ["gentle", "nostalgic", "soothing"],
    targetConditions: ["Depression", "Stress"],
    reasoning:
      "The slow, contemplative melody lifts low moods gently and eases rumination.",
    spotifyUrl: "https://open.spotify.com/track/5NGtFXVpXSvwunEIGeviY3",
    youtubeUrl: "https://www.youtube.com/watch?v=S-Xm7s9eGxU",
    coverEmoji: "🎹",
    color: "from-amber-500/20 to-amber-500/5 border-amber-500/20",
  },
  {
    id: "m4",
    title: "River Flows in You",
    artist: "Yiruma",
    genre: "Contemporary Classical",
    bpm: 68,
    duration: "3:44",
    moodTags: ["hopeful", "serene", "uplifting"],
    targetConditions: ["Depression", "Anxiety"],
    reasoning:
      "The gently rising melody creates a sense of hope and forward movement, countering depressive thought patterns.",
    spotifyUrl: "https://open.spotify.com/track/4fK9iLQF1HQRNMDVExQeEU",
    youtubeUrl: "https://www.youtube.com/watch?v=7maJOI3QMu0",
    coverEmoji: "🌊",
    color: "from-teal-500/20 to-teal-500/5 border-teal-500/20",
  },
  {
    id: "m5",
    title: "Forest Rain",
    artist: "Nature Sounds Collective",
    genre: "Nature Sounds",
    bpm: 0,
    duration: "60:00",
    moodTags: ["grounding", "earthy", "peaceful"],
    targetConditions: ["Stress", "Anxiety", "Bipolar"],
    reasoning:
      "Binaural nature sounds reduce cortisol and promote grounding, ideal for overstimulated minds.",
    spotifyUrl: "https://open.spotify.com/track/4R1nftUxeEfI9O4q4JR5t3",
    youtubeUrl: "https://www.youtube.com/watch?v=xNN7iTA57jM",
    soundcloudUrl: "https://soundcloud.com/relaxation-sounds/forest-rain",
    coverEmoji: "🌲",
    color: "from-green-500/20 to-green-500/5 border-green-500/20",
  },
  {
    id: "m6",
    title: "Experience",
    artist: "Ludovico Einaudi",
    genre: "Neoclassical",
    bpm: 80,
    duration: "5:13",
    moodTags: ["emotional", "moving", "beautiful"],
    targetConditions: ["Depression", "Stress"],
    reasoning:
      "Einaudi's layered strings create a safe emotional space, enabling the listener to process difficult feelings.",
    spotifyUrl: "https://open.spotify.com/track/2VEZx7NWsZ1D0eJ4uv5Fym",
    youtubeUrl: "https://www.youtube.com/watch?v=hN_q-_nGv4U",
    coverEmoji: "🎻",
    color: "from-rose-500/20 to-rose-500/5 border-rose-500/20",
  },
  {
    id: "m7",
    title: "Teardrop",
    artist: "Massive Attack",
    genre: "Electronic / Trip-hop",
    bpm: 91,
    duration: "5:29",
    moodTags: ["meditative", "introspective", "steady"],
    targetConditions: ["Anxiety", "Bipolar"],
    reasoning:
      "The steady, hypnotic beat anchors racing thoughts and provides a rhythmic focal point for mindfulness.",
    spotifyUrl: "https://open.spotify.com/track/6E1vphGsb77DUHW1RJGVU9",
    youtubeUrl: "https://www.youtube.com/watch?v=u7K72X4eo_s",
    coverEmoji: "💿",
    color: "from-purple-500/20 to-purple-500/5 border-purple-500/20",
  },
  {
    id: "m8",
    title: "Here Comes the Sun",
    artist: "The Beatles",
    genre: "Pop / Rock",
    bpm: 129,
    duration: "3:05",
    moodTags: ["uplifting", "joyful", "optimistic"],
    targetConditions: ["Depression", "Neutral"],
    reasoning:
      "Upbeat tempo and positive lyrics activate dopamine pathways, providing a gentle mood lift.",
    spotifyUrl: "https://open.spotify.com/track/6dGnYIeXmHdcikdzNNDMm2",
    youtubeUrl: "https://www.youtube.com/watch?v=KQetemT1sWc",
    coverEmoji: "☀️",
    color: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/20",
  },
  {
    id: "m9",
    title: "Ocean Waves (Binaural)",
    artist: "Calm Collective",
    genre: "Nature / Binaural",
    bpm: 0,
    duration: "45:00",
    moodTags: ["sleepy", "serene", "deep"],
    targetConditions: ["Stress", "Anxiety", "Depression"],
    reasoning:
      "Alpha-wave ocean binaural beats (8–14 Hz) promote relaxation and creative thinking.",
    spotifyUrl: "https://open.spotify.com/track/0y9wBHWMEVMwFJKpBSRPjP",
    youtubeUrl: "https://www.youtube.com/watch?v=lFcSrYw-ARY",
    soundcloudUrl: "https://soundcloud.com/sleep-sounds/ocean-waves-binaural",
    coverEmoji: "🌊",
    color: "from-blue-500/20 to-blue-500/5 border-blue-500/20",
  },
  {
    id: "m10",
    title: "Breathe (2 AM)",
    artist: "Anna Nalick",
    genre: "Pop / Acoustic",
    bpm: 76,
    duration: "4:26",
    moodTags: ["comforting", "relatable", "gentle"],
    targetConditions: ["Anxiety", "Depression", "Stress"],
    reasoning:
      "Acoustic warmth and validating lyrics ('just breathe') normalize difficult emotions and reduce isolation.",
    spotifyUrl: "https://open.spotify.com/track/4lZ9B6GH5YQXL6TMq7d8gZ",
    youtubeUrl: "https://www.youtube.com/watch?v=GxioHVKCMaU",
    coverEmoji: "🎸",
    color: "from-lime-500/20 to-lime-500/5 border-lime-500/20",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getGamesForPrediction(
  prediction: MentalState
): RelaxationGame[] {
  const matching = RELAXATION_GAMES.filter((g) =>
    g.targetConditions.includes(prediction)
  );
  // Fall back to all games if none match
  return matching.length > 0 ? matching : RELAXATION_GAMES;
}

export function getMusicForPrediction(prediction: MentalState): MusicTrack[] {
  const matching = MUSIC_TRACKS.filter((t) =>
    t.targetConditions.includes(prediction)
  );
  return matching.length > 0 ? matching : MUSIC_TRACKS;
}
