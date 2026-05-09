import { NextRequest, NextResponse } from "next/server";
import { requirePatient } from "@/lib/rbac";
import { isAuthed } from "@/lib/rbac";
import { GameSession, GameStats, UserAchievement } from "@/models/GameStats";
import { connectDB } from "@/lib/db";

// ─── POST /api/games/sessions ──────────────────────────────────────────────────
// Record a game session

export async function POST(req: NextRequest) {
  try {
    const authResult = requirePatient(req);
    if (!isAuthed(authResult)) return authResult;

    const { user } = authResult;
    await connectDB();

    const body = await req.json();
    const { gameId, gameName, category, score, completed, timeSpent, stats } = body;

    // Create new game session
    const session = await GameSession.create({
      userId: user.id,
      gameId,
      gameName,
      score,
      completed,
      timeSpent,
      stats,
      endTime: new Date(),
    });

    // Update game stats
    let gameStats = await GameStats.findOne({ userId: user.id, gameId });

    if (gameStats) {
      gameStats.gamesPlayed += 1;
      gameStats.totalTimeSpent += timeSpent || 0;
      gameStats.totalPoints += score || 0;
      gameStats.lastPlayed = new Date();

      if (score > gameStats.bestScore) {
        gameStats.bestScore = score;
      }

      gameStats.averageScore =
        gameStats.totalPoints / gameStats.gamesPlayed;

      gameStats.sessionHistory.push({
        playedAt: new Date(),
        score: score || 0,
        timeSpent: timeSpent || 0,
        completed: completed || false,
      });

      await gameStats.save();
    } else {
      gameStats = await GameStats.create({
        userId: user.id,
        gameId,
        gameName,
        category,
        gamesPlayed: 1,
        bestScore: score || 0,
        totalPoints: score || 0,
        averageScore: score || 0,
        totalTimeSpent: timeSpent || 0,
        lastPlayed: new Date(),
        sessionHistory: [
          {
            playedAt: new Date(),
            score: score || 0,
            timeSpent: timeSpent || 0,
            completed: completed || false,
          },
        ],
      });
    }

    // Check and award achievements
    await checkAndAwardAchievements(user.id, gameId, gameStats);

    return NextResponse.json(
      { message: "Game session recorded", session, gameStats },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error recording game session:", error);
    return NextResponse.json(
      { error: "Failed to record game session" },
      { status: 500 }
    );
  }
}

// ─── GET /api/games/stats ─────────────────────────────────────────────────────
// Get user's game statistics

export async function GET(req: NextRequest) {
  try {
    const authResult = requirePatient(req);
    if (!isAuthed(authResult)) return authResult;

    const { user } = authResult;
    await connectDB();

    const gameId = req.nextUrl.searchParams.get("gameId");

    if (gameId) {
      const stats = await GameStats.findOne({ userId: user.id, gameId });
      return NextResponse.json(stats || {});
    }

    const allStats = await GameStats.find({ userId: user.id }).sort({
      gamesPlayed: -1,
    });

    return NextResponse.json(allStats);
  } catch (error) {
    console.error("Error fetching game stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch game stats" },
      { status: 500 }
    );
  }
}

// ─── Helper: Check and Award Achievements ──────────────────────────────────────

async function checkAndAwardAchievements(
  userId: string,
  gameId: string,
  gameStats: any
) {
  try {
    const achievements = [
      {
        id: "first-bubble",
        name: "Bubble Buster",
        condition: gameId === "bubble-pop" && gameStats.gamesPlayed === 1,
      },
      {
        id: "memory-master",
        name: "Memory Master",
        condition: gameId === "memory-match" && gameStats.bestScore >= 10,
      },
      {
        id: "calm-breather",
        name: "Calm Breather",
        condition:
          gameId === "breathing-guide" &&
          gameStats.gamesPlayed >= 3,
      },
      {
        id: "puzzle-pro",
        name: "Puzzle Pro",
        condition: gameId === "zen-puzzle" && gameStats.gamesPlayed >= 5,
      },
      {
        id: "daily-player",
        name: "Daily Player",
        condition: gameStats.gamesPlayed >= 7,
      },
      {
        id: "game-enthusiast",
        name: "Game Enthusiast",
        condition: gameStats.gamesPlayed >= 50,
      },
    ];

    for (const achievement of achievements) {
      if (achievement.condition) {
        const existing = await UserAchievement.findOne({
          userId,
          achievementId: achievement.id,
        });

        if (!existing) {
          await UserAchievement.create({
            userId,
            achievementId: achievement.id,
            achievementName: achievement.name,
            unlockedAt: new Date(),
          });
        }
      }
    }
  } catch (error) {
    console.error("Error checking achievements:", error);
  }
}
