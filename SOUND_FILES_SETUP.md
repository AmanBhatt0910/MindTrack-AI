# 🔊 Sound Files Setup Guide

## Required Sound Files

The games feature requires audio files to be placed in `/public/sounds/`. Below is a list of all required and optional sound files.

### Required Sound Files Structure

```
public/
└── sounds/
    ├── bubble-pop.mp3           # Bubble popping sound (short, satisfying)
    ├── bubble-success.mp3       # Success confirmation for bubbles
    ├── bubble-ambient.mp3       # Background music for bubble pop game
    ├── card-flip.mp3            # Card flip sound effect
    ├── match-success.mp3        # Success sound when matching cards
    ├── memory-ambient.mp3       # Background music for memory match
    ├── breathing-ambient.mp3    # Calming ambient for breathing
    ├── level-up.mp3             # Achievement/level up sound
    ├── wrong-sequence.mp3       # Error sound
    ├── color-click.mp3          # Click sound for colors
    ├── puzzle-slide.mp3         # Puzzle piece slide sound
    ├── puzzle-complete.mp3      # Puzzle completion sound
    ├── puzzle-ambient.mp3       # Background music for puzzles
    ├── tap-success.mp3          # Tap flow game success
    ├── tap-flow-music.mp3       # Background music for tap flow
    ├── color-fill.mp3           # Mandala color fill sound
    ├── art-ambient.mp3          # Background music for art
    ├── art-complete.mp3         # Art completion sound
    ├── word-select.mp3          # Word selection sound
    ├── word-found.mp3           # Word found success sound
    └── meditation-ambient.mp3   # Background for body scan
```

## How to Create Sound Files

### Option 1: Use Online Tools
1. **Freesound.org** - Free community sound library
2. **Zapsplat.com** - Free sound effects
3. **Pixabay.com** - Free music and sound effects
4. **Freepik.com** - Stock sound effects

### Option 2: Use Online Sound Generators
1. **Jsfxr.com** - Retro sound effect generator
2. **Beepbox.co** - Simple music composition
3. **Bfxr.net** - 8-bit sound generator

### Option 3: Use Audio Processing Software
1. **Audacity** (Free) - Record and edit audio
2. **GarageBand** (Mac) - Built-in music creation
3. **Adobe Audition** (Paid) - Professional audio editing

### Option 4: Use AI Tools
1. **AIVA.ai** - AI music composition
2. **Soundraw.io** - AI music generator
3. **Mubert.com** - AI music generator

## Recommended Audio Settings

### For Sound Effects
- **Format**: MP3 (compressed)
- **Bitrate**: 128 kbps (quality vs size tradeoff)
- **Sample Rate**: 44.1 kHz
- **Channels**: Mono or Stereo
- **Length**: 0.2 - 1.5 seconds (short & punchy)

### For Background Music
- **Format**: MP3 (compressed)
- **Bitrate**: 192-256 kbps (higher quality needed)
- **Sample Rate**: 44.1 kHz
- **Channels**: Stereo
- **Length**: 1-3 minutes (or loopable)
- **Loop**: Should fade/loop smoothly

### Recommended Volume Levels
- **Sound Effects**: -12dB to -6dB
- **Background Music**: -20dB to -15dB (in code: 0.3-0.5 volume)

## Recommended Sounds Characteristics

### Bubble Pop (bubble-pop.mp3)
- **Description**: Soft, satisfying pop sound
- **Length**: 0.3 seconds
- **Characteristics**: 
  - High-pitched (500-1000 Hz)
  - Short attack, quick decay
  - Non-aggressive, pleasant
- **Example**: Bubble wrap popping, water droplet

### Card Flip (card-flip.mp3)
- **Description**: Crisp card flip sound
- **Length**: 0.2 seconds
- **Characteristics**:
  - Mid-range frequency (200-400 Hz)
  - Quick and snappy
- **Example**: Playing card flip, page turn

### Match Success (match-success.mp3)
- **Description**: Cheerful confirmation sound
- **Length**: 0.4 seconds
- **Characteristics**:
  - Pleasant ascending pitch
  - Two-tone or chime-like
- **Example**: "Ding" or happy chime

### Level Up (level-up.mp3)
- **Description**: Achievement/completion sound
- **Length**: 0.6 seconds
- **Characteristics**:
  - Ascending pitch progression
  - Energetic and celebratory
- **Example**: 8-bit level up, game achievement

### Background Music
- **Description**: Calm, meditative, non-intrusive
- **Length**: 1-3 minutes or loopable
- **Characteristics**:
  - Gentle melodies
  - Minimal beat (if any)
  - 60-80 BPM
  - Avoid lyrics
  - Loop smoothly

## Quick File Sources

### Collections to Download From
1. **Freesound.org**
   - Search: "bubble pop", "card flip", "chime success"
   - Filter: Creative Commons license

2. **Zapsplat.com**
   - Free sound effects by category
   - No registration needed for download

3. **Pixabay**
   - Free royalty-free music
   - Can use for commercial use

4. **OpenGameArt.org**
   - Game audio specifically
   - Licensed for reuse

## Implementation Instructions

1. **Create Directory**
   ```bash
   mkdir -p public/sounds
   ```

2. **Add Sound Files**
   - Download MP3 files from sources above
   - Place in `public/sounds/` directory
   - Keep filenames exactly as specified

3. **Optimize Files**
   ```bash
   # Using ffmpeg to optimize:
   ffmpeg -i original.mp3 -ab 128k -ar 44100 optimized.mp3
   ```

4. **Test Sound Loading**
   - Navigate to `/games` page
   - Click sound toggle to enable
   - Play a game
   - Verify sounds play (check console for errors)

## Troubleshooting Audio

### Sounds Not Playing
1. Check browser console for errors
2. Verify files exist in `/public/sounds/`
3. Check file names match exactly (case-sensitive on Linux/Mac)
4. Verify browser autoplay policy allows sound
5. Check volume settings
6. Try different browser

### Audio Quality Issues
1. Increase bitrate for better quality
2. Use stereo instead of mono for music
3. Ensure sample rate is 44.1 kHz
4. Compress using LAME encoder for better compatibility

### Performance Issues
1. Use smaller file sizes (compress to 128 kbps)
2. Reduce music length
3. Cache is automatic (no action needed)
4. Clear browser cache if issues persist

## Code Reference

### Playing Sounds Manually
```typescript
import { SoundEffects } from "@/features/games/utils/soundEffects";

// Play a specific sound
SoundEffects.play("/sounds/bubble-pop.mp3", 0.4);

// Use predefined methods
SoundEffects.bubblePop();
SoundEffects.matchSuccess();
SoundEffects.levelUp();

// Stop sound
SoundEffects.stop("/sounds/bubble-pop.mp3");

// Stop all sounds
SoundEffects.stopAll();

// Toggle sound
SoundEffects.setSoundEnabled(!SoundEffects.isSoundEnabled());
```

### Audio Path Reference
All audio files use this path format:
```
/sounds/[filename].mp3
```

The full URL will be:
```
https://your-domain.com/sounds/bubble-pop.mp3
```

## Legal & Licensing

### Important
- Ensure all sound files are properly licensed
- Check Creative Commons licenses
- Respect artist attribution requirements
- Don't use copyrighted music without permission

### Recommended Licenses
- CC0 (Public Domain)
- CC-BY (Attribution required)
- CC-BY-SA (Attribution + ShareAlike)

### Attribution Example
If required, add to game README:
```
Sound Effects:
- Bubble Pop: [Artist Name] - [License]
- Card Flip: [Artist Name] - [License]
```

## Optional: Host Audio Externally

If file sizes are too large for your server:
1. Upload to CDN (Cloudinary, AWS S3, etc.)
2. Update audio paths in code
3. Benefits: Faster loading, reduced server load
4. Note: Additional costs may apply

## Monitoring

### Check Audio Loading
```typescript
// Monitor in browser console
window.addEventListener("load", () => {
  console.log("Check Network tab for sounds loading");
});
```

### Performance Metrics
- Monitor in DevTools Network tab
- Each sound should load < 1 second
- Total audio directory < 10 MB

---

## Summary

1. Create `public/sounds/` directory
2. Download 20 sound files from provided sources
3. Place files with exact names
4. Test on `/games` page
5. Verify audio plays in different browsers
6. Monitor performance

**Estimated Setup Time**: 15-30 minutes
**Total File Size**: ~5-8 MB
**Formats**: All MP3 files

