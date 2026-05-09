// ─── Audio Utility ────────────────────────────────────────────────────────────

export class SoundEffects {
  private static audioCache: Record<string, HTMLAudioElement> = {};
  private static soundEnabled = true;

  private static audioCtx: AudioContext | null = null;

  static init() {
    // Initialize sound settings from localStorage
    const stored = localStorage.getItem("sound-enabled");
    this.soundEnabled = stored !== null ? stored === "true" : true;
    
    // Initialize Web Audio API for synthetic fallbacks
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContext();
    } catch (e) {
      console.warn("Web Audio API not supported");
    }
  }

  static setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    localStorage.setItem("sound-enabled", String(enabled));
  }

  static isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  // --- Synthetic Sound Fallbacks ---
  private static playSyntheticTone(frequency: number, type: OscillatorType, duration: number, volume: number) {
    if (!this.soundEnabled || !this.audioCtx) return;
    
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }

    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

    // Fade out to avoid clicks
    gainNode.gain.setValueAtTime(volume, this.audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + duration);
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
          console.debug("Audio file failed, using synthetic fallback", error);
          this.playFallbackFor(soundPath, volume);
        });
      }
    } catch (error) {
      console.debug("Sound effect failed:", error);
    }
  }

  private static playFallbackFor(path: string, volume: number) {
    if (path.includes("bubble-pop")) {
      this.playSyntheticTone(800, "sine", 0.1, volume);
    } else if (path.includes("card-flip")) {
      this.playSyntheticTone(300, "square", 0.1, volume * 0.5);
    } else if (path.includes("match-success")) {
      this.playSyntheticTone(600, "sine", 0.1, volume);
      setTimeout(() => this.playSyntheticTone(800, "sine", 0.2, volume), 100);
    } else if (path.includes("level-up")) {
      this.playSyntheticTone(400, "square", 0.1, volume);
      setTimeout(() => this.playSyntheticTone(500, "square", 0.1, volume), 100);
      setTimeout(() => this.playSyntheticTone(600, "square", 0.3, volume), 200);
    } else if (path.includes("wrong")) {
      this.playSyntheticTone(150, "sawtooth", 0.3, volume);
    } else if (path.includes("click") || path.includes("tap")) {
      this.playSyntheticTone(1000, "sine", 0.05, volume * 0.3);
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
