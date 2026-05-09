# 🎮 Mental Health Games Feature

## Overview

The Mental Health Games feature provides interactive, therapeutic mini-games designed to improve mental wellbeing, reduce stress, anxiety, and promote mindfulness. Games are categorized by purpose and difficulty level, with sound effects, animations, and achievement tracking.

## Features

### 🎯 Core Features

1. **9 Interactive Games**
   - **Bubble Pop** - Stress relief through satisfying pop mechanics
   - **Memory Match** - Cognitive enhancement and focus training
   - **Breathing Guide** - Guided meditation with visual breathing cues
   - **Color Sequence** - Pattern recognition and reaction time
   - **Zen Puzzle** - Meditative sliding puzzles
   - **Body Scan** - Guided body relaxation
   - **Tap Flow** - Rhythm-based relaxation
   - **Mandala Drawing** - Creative art therapy
   - **Word Calm** - Word search with calming words

2. **Game Categories**
   - 🌬️ Breathing
   - 🎮 Memory
   - 🧩 Puzzles
   - 😌 Relaxation
   - 👁️ Focus
   - 🧘 Mindfulness

3. **Difficulty Levels**
   - Easy (beginner-friendly)
   - Medium (some challenge)
   - Hard (advanced players)

4. **Achievement System**
   - 🫧 Bubble Buster - Pop your first bubble
   - 🎮 Memory Master - Match all pairs without mistakes
   - 🌬️ Calm Breather - Complete 3 breathing sessions
   - 🧩 Puzzle Pro - Solve 5 puzzles
   - 🎯 Daily Player - Play games for 7 consecutive days
   - 🏆 Game Enthusiast - Play 50 games total

5. **Sound Effects & Animations**
   - Customizable sound on/off toggle
   - Smooth Framer Motion animations
   - Visual feedback for interactions
   - Sound effects for achievements

### 🔐 Role-Based Access

- **Patients**: Full access to all games
- **Doctors**: Full access to all games + can view patient game progress
- **Admin**: Full access

### 📊 Game Statistics Tracking

Each game tracks:
- Total plays
- Best score
- Average score
- Total time spent
- Session history
- Achievements unlocked
- Last played date

## File Structure

```
src/
├── app/
│   ├── games/
│   │   └── page.tsx                 # Games page
│   └── api/
│       └── games/
│           └── stats/
│               └── route.ts         # Game stats API
├── features/
│   └── games/
│       ├── components/
│       │   └── GamesComponent.tsx   # Main games UI
│       ├── services/
│       │   └── games.service.ts     # Game definitions & utilities
│       ├── types/
│       │   └── games.types.ts       # TypeScript types
│       └── utils/
│           └── soundEffects.ts      # Sound management utility
├── models/
│   └── GameStats.ts                 # Database models
└── constants/
    └── translations.ts              # i18n support (EN + HI)
```

## Implementation Details

### Game Components

The `GamesComponent` renders:

1. **Game Gallery** - Grid of all available games with filtering by category
2. **Game Launcher** - Clickable game cards that open the game
3. **Game Player** - Individual game interface with:
   - Instructions panel
   - Game info (difficulty, duration, benefits)
   - Score display
   - Game canvas/interface
4. **Achievement Tracker** - Shows unlocked achievements and progress

### Interactive Games Implemented

#### 1. Bubble Pop Game
- Generates up to 15 bubbles with smooth animations
- Click/tap bubbles to pop them
- Sound effect on each pop
- Score tracking
- Reset functionality

#### 2. Memory Match Game
- 12 cards (6 pairs) with emoji
- Flip cards to find matches
- Tracks number of moves
- Completion detection
- Score calculation (12 - moves)

#### 3. Breathing Guide Game
- 8-cycle breathing routine
- 4 sec inhale, 4 sec hold, 8 sec exhale
- Animated breathing circle
- Progress tracking
- Relaxation completion

### Sound Effects Management

The `SoundEffects` utility:
- Caches audio files for performance
- Respects user sound preferences (localStorage)
- Gracefully handles audio errors
- Provides predefined sound methods:
  - `bubblePop()`
  - `cardFlip()`
  - `matchSuccess()`
  - `levelUp()`
  - `wrongSequence()`
  - etc.

### Database Models

**GameStats**: Tracks cumulative statistics per user per game
**GameSession**: Records individual game plays
**UserAchievement**: Tracks unlocked achievements

## Usage

### Playing a Game

1. Navigate to **Games** from sidebar
2. Browse games by category or view all
3. Click on a game card to play
4. Follow on-screen instructions
5. Game records automatically to your stats

### Tracking Progress

- View **Best Score** badge on game cards
- See achievements in the info panel
- Access full stats via API at `/api/games/stats`

### API Endpoints

#### Record Game Session
```
POST /api/games/stats
{
  gameId: "bubble-pop",
  gameName: "Bubble Pop",
  score: 15,
  completed: true,
  timeSpent: 300
}
```

#### Get User Game Stats
```
GET /api/games/stats?gameId=bubble-pop
```

## Frontend Integration

The games feature is integrated into:
- **Sidebar**: New "Games" navigation link
- **Dashboard**: Recommendations show relevant games
- **Role-based access**: All authenticated users can access games

## Customization

### Adding New Games

1. Add game definition to `MINI_GAMES` array in `games.service.ts`
2. Create game component in `GamesComponent.tsx`
3. Add category if needed to `GAME_CATEGORIES`
4. Add translations to `translations.ts`
5. Implement game logic with proper state management
6. Update achievements if needed

### Game Definition Structure

```typescript
{
  id: "unique-id",
  name: "Game Name",
  emoji: "🎮",
  description: "What the game does",
  category: "relaxation",
  difficulty: "medium",
  duration: "10 min",
  durationSeconds: 600,
  targetBenefits: ["Stress Relief", "Focus"],
  instructions: ["Step 1", "Step 2", ...],
  color: "from-blue-500/20 to-blue-500/5 border-blue-500/20",
  audio: {
    backgroundMusic: "/sounds/game-ambient.mp3",
    soundEffects: {
      click: "/sounds/click.mp3",
      success: "/sounds/success.mp3",
    }
  }
}
```

## Audio Files

Add these sound files to `public/sounds/`:
- `bubble-pop.mp3` - Bubble popping sound
- `bubble-success.mp3` - Success confirmation
- `card-flip.mp3` - Card flip sound
- `match-success.mp3` - Match found
- `level-up.mp3` - Level up sound
- `puzzle-ambient.mp3` - Background music
- And others as needed

## Performance Optimization

- Audio caching reduces redundant file loads
- Lazy component loading for games
- Optimized animations with Framer Motion
- Minimal re-renders with proper memoization
- Database indexing on userId and gameId

## Accessibility

- Keyboard navigation support
- Sound toggle for accessibility
- Clear instructions for each game
- Difficulty indicators
- Progress feedback

## Testing

To test the games feature:

1. Navigate to `/games` page
2. Try each game category filter
3. Play a game and verify score tracking
4. Check API response at `/api/games/stats`
5. Verify achievements unlock
6. Test sound on/off toggle
7. Test on mobile and desktop

## Future Enhancements

- 🎵 Custom background music selection
- 👥 Multiplayer modes for competitive games
- 🏆 Global leaderboards
- 🎁 Reward system (unlock therapist discounts, etc.)
- 📱 Offline play capability
- 🌍 More games (20+)
- 🎨 Game customization options
- 📊 Advanced analytics and insights

## Mental Health Benefits

Research supports these game mechanics for mental health:
- **Bubble Pop**: Sensory satisfaction reduces anxiety
- **Memory Games**: Cognitive engagement breaks negative thought cycles
- **Breathing**: Parasympathetic activation calms nervous system
- **Puzzles**: Problem-solving boosts dopamine and confidence
- **Creative Games**: Artistic expression promotes emotional processing
- **Rhythm Games**: Synchronized movement enhances mood

## Support

For issues or feature requests:
- Check existing game instructions
- Verify sound files are in `/public/sounds/`
- Check browser console for audio errors
- Ensure proper permissions for sound playback
