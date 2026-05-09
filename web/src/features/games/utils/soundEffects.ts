// ─── Audio Utility ────────────────────────────────────────────────────────────

export class SoundEffects {
  private static audioCache: Record<string, HTMLAudioElement> = {};
  private static soundEnabled = true;

  static init() {
    // Initialize sound settings from localStorage
    const stored = localStorage.getItem("sound-enabled");
    this.soundEnabled = stored !== null ? stored === "true" : true;
  }

  static setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    localStorage.setItem("sound-enabled", String(enabled));
  }

  static isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  static play(soundPath: string, volume = 0.5, loop = false) {
    if (!this.soundEnabled) return;

    try {
      let audio = this.audioCache[soundPath];

      if (!audio) {
        audio = new Audio(soundPath);
        this.audioCache[soundPath] = audio;
      }

      audio.volume = volume;
      audio.loop = loop;

      // Reset and play
      audio.currentTime = 0;
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.debug("Audio playback failed:", error);
        });
      }
    } catch (error) {
      console.debug("Sound effect failed:", error);
    }
  }

  static stop(soundPath: string) {
    const audio = this.audioCache[soundPath];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  static stopAll() {
    Object.values(this.audioCache).forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  // ─── Predefined Sound Effects ──────────────────────────────────────────────

  static bubblePop() {
    this.play("/sounds/bubble-pop.mp3", 0.4);
  }

  static cardFlip() {
    this.play("/sounds/card-flip.mp3", 0.3);
  }

  static matchSuccess() {
    this.play("/sounds/match-success.mp3", 0.4);
  }

  static levelUp() {
    this.play("/sounds/level-up.mp3", 0.5);
  }

  static wrongSequence() {
    this.play("/sounds/wrong-sequence.mp3", 0.3);
  }

  static colorClick() {
    this.play("/sounds/color-click.mp3", 0.2);
  }

  static puzzleSlide() {
    this.play("/sounds/puzzle-slide.mp3", 0.3);
  }

  static puzzleComplete() {
    this.play("/sounds/puzzle-complete.mp3", 0.5);
  }

  static tapSuccess() {
    this.play("/sounds/tap-success.mp3", 0.3);
  }

  static colorFill() {
    this.play("/sounds/color-fill.mp3", 0.3);
  }

  static artComplete() {
    this.play("/sounds/art-complete.mp3", 0.4);
  }

  static wordSelect() {
    this.play("/sounds/word-select.mp3", 0.3);
  }

  static wordFound() {
    this.play("/sounds/word-found.mp3", 0.4);
  }
}

// Initialize on module load
if (typeof window !== "undefined") {
  SoundEffects.init();
}
