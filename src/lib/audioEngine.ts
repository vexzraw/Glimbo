import * as Tone from "tone";
import type { Instrument } from "./types";

// Pentatonic-ish scales per instrument mood, spanning a couple octaves
// so notes can rise/fall with the player's speed.
const SCALES: Record<Instrument, string[]> = {
  harp: ["C4", "D4", "E4", "G4", "A4", "C5", "D5", "E5", "G5", "A5", "C6"],
  piano: ["C3", "D3", "F3", "G3", "A3", "C4", "D4", "F4", "G4", "A4", "C5"],
  xylophone: ["A4", "C5", "D5", "E5", "G5", "A5", "C6", "D6", "E6"],
};

const CHORDS: string[][] = [
  ["C4", "E4", "G4", "B4", "D5"],
  ["D4", "F4", "A4", "C5", "E5"],
  ["F3", "A3", "C4", "E4", "G4"],
  ["G3", "B3", "D4", "F4", "A4"],
];

class AudioEngine {
  private started = false;
  private masterMusic!: Tone.Volume;
  private masterSfx!: Tone.Volume;
  private reverb!: Tone.Reverb;
  private delay!: Tone.FeedbackDelay;

  private harp!: Tone.PluckSynth;
  private piano!: Tone.PolySynth;
  private xylo!: Tone.PolySynth;
  private chordSynth!: Tone.PolySynth;
  private bell!: Tone.PolySynth;
  private padSynth!: Tone.PolySynth;
  private padLoop: Tone.Loop | null = null;

  // Click sound synth (soft UI click)
  private clickSynth!: Tone.NoiseSynth;

  // Menu MP3 music system — Tone.Player path (preferred)
  private menuPlayer: Tone.Player | null = null;
  // Menu MP3 music system — HTML5 Audio fallback (always works once user has interacted)
  private menuHtmlAudio: HTMLAudioElement | null = null;
  private menuMusicLoaded = false;
  private menuMusicOn = false;
  private menuMusicSource: string | null = null;

  private lastPlay = 0;
  private lastMusicGain = 0.8;

  init() {
    if (this.started) return;
    this.started = true;

    this.masterMusic = new Tone.Volume(-6).toDestination();
    this.masterSfx = new Tone.Volume(-4).toDestination();

    this.reverb = new Tone.Reverb({ decay: 6, wet: 0.42, preDelay: 0.02 });
    this.reverb.connect(this.masterSfx);
    this.delay = new Tone.FeedbackDelay({ delayTime: 0.28, feedback: 0.22, wet: 0.18 });
    this.delay.connect(this.reverb);

    // Crystal harp — plucked string, bright & clean
    this.harp = new Tone.PluckSynth({
      attackNoise: 0.6,
      dampening: 3200,
      resonance: 0.92,
    });
    this.harp.volume.value = -6;
    this.harp.connect(this.delay);
    this.harp.connect(this.reverb);

    // Soft piano-like tone
    this.piano = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 1.5,
      modulationIndex: 2,
      envelope: { attack: 0.01, decay: 0.6, sustain: 0.15, release: 1.4 },
      modulationEnvelope: { attack: 0.02, decay: 0.3, sustain: 0.1, release: 0.8 },
    });
    this.piano.volume.value = -8;
    this.piano.connect(this.reverb);

    // Xylophone — bright, short, glassy
    this.xylo = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3.5,
      modulationIndex: 8,
      envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.4 },
    });
    this.xylo.volume.value = -10;
    this.xylo.connect(this.reverb);

    // Full satisfying chord for level completion
    this.chordSynth = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 2,
      modulationIndex: 3,
      envelope: { attack: 0.05, decay: 1.2, sustain: 0.3, release: 3 },
    });
    this.chordSynth.volume.value = -10;
    this.chordSynth.connect(this.reverb);

    // Gentle bell for the "thread breaks" moment
    this.bell = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 4,
      modulationIndex: 1,
      envelope: { attack: 0.001, decay: 1.4, sustain: 0, release: 1.2 },
    });
    this.bell.volume.value = -14;
    this.bell.connect(this.reverb);

    // Ambient background pad while playing
    this.padSynth = new Tone.PolySynth(Tone.AMSynth, {
      envelope: { attack: 4, decay: 2, sustain: 0.6, release: 6 },
    });
    this.padSynth.volume.value = -22;
    this.padSynth.connect(this.reverb);

    // Soft UI click — short filtered noise tick
    this.clickSynth = new Tone.NoiseSynth({
      noise: { type: "white" },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0 },
    });
    this.clickSynth.volume.value = -22;
    const clickFilter = new Tone.Filter({ type: "lowpass", frequency: 2200, Q: 0.7 });
    this.clickSynth.connect(clickFilter);
    clickFilter.connect(this.masterSfx);
  }

  async unlock() {
    if (typeof window === "undefined") return;
    try {
      await Tone.start();
    } catch (err) {
      console.warn("Tone.start() failed:", err);
    }
    this.init();
  }

  /** Soft click sound for UI buttons. Safe to call before unlock — will no-op. */
  playClick() {
    if (!this.started) return;
    try {
      this.clickSynth.triggerAttackRelease("32n", Tone.now());
    } catch {
      /* ignore */
    }
  }

  /** Best-effort click that also unlocks audio on first call. Use from user gestures. */
  async clickWithUnlock() {
    if (!this.started) {
      await this.unlock();
    }
    this.playClick();
  }

  setMusicVolume(v: number) {
    this.lastMusicGain = Math.max(0, Math.min(1, v));
    if (this.masterMusic) {
      this.masterMusic.volume.value = Tone.gainToDb(Math.max(0.0001, v));
    }
    // Apply to HTML5 menu audio as well
    if (this.menuHtmlAudio) {
      this.menuHtmlAudio.volume = this.lastMusicGain;
    }
  }

  setSfxVolume(v: number) {
    if (!this.masterSfx) return;
    this.masterSfx.volume.value = Tone.gainToDb(Math.max(0.0001, v));
  }

  /** Plays a note for hitting a star. speed 0..1 maps to pitch offset. */
  playStarNote(instrument: Instrument, index: number, speed: number) {
    if (!this.started) return;
    const now = Tone.now();
    if (now - this.lastPlay < 0.03) return; // tiny debounce
    this.lastPlay = now;

    const scale = SCALES[instrument];
    const speedOffset = Math.round((speed - 0.5) * 4); // -2..+2 scale steps
    const idx = Math.max(0, Math.min(scale.length - 1, (index % scale.length) + speedOffset));
    const note = scale[idx];

    if (instrument === "harp") {
      this.harp.triggerAttack(note, now);
    } else if (instrument === "piano") {
      this.piano.triggerAttackRelease(note, "4n", now, 0.7);
    } else {
      this.xylo.triggerAttackRelease(note, "8n", now, 0.8);
    }
  }

  /** Soft bell sound for when the trail breaks */
  playBreakChime() {
    if (!this.started) return;
    const now = Tone.now();
    this.bell.triggerAttackRelease(["A4", "E5"], "2n", now, 0.35);
  }

  /** Full chord for level completion */
  playCompleteChord(seed = 0) {
    if (!this.started) return;
    const chord = CHORDS[seed % CHORDS.length];
    const now = Tone.now();
    this.chordSynth.triggerAttackRelease(chord, "2n", now, 0.55);
    // sparkling arpeggio flourish
    chord.forEach((note, i) => {
      this.harp.triggerAttack(note, now + 0.12 + i * 0.09);
    });
    const octaveUp = chord.map((n) => Tone.Frequency(n).transpose(12).toNote());
    octaveUp.forEach((note, i) => {
      this.harp.triggerAttack(note, now + 0.5 + i * 0.09);
    });
  }

  startAmbientPad(rootNotes: string[] = ["C3", "G3", "E4"]) {
    if (!this.started || !this.padSynth) return;
    this.stopAmbientPad();
    this.padSynth.triggerAttack(rootNotes, Tone.now());
    this.padLoop = new Tone.Loop((time) => {
      this.padSynth.triggerAttack(rootNotes, time);
    }, "8m").start(0);
    Tone.Transport.start();
  }

  stopAmbientPad() {
    if (this.padLoop) {
      this.padLoop.dispose();
      this.padLoop = null;
    }
    if (this.padSynth) this.padSynth.releaseAll();
  }

  // ============ MENU MP3 MUSIC ============

  /**
   * Load an audio file (File object from an <input type="file">) as menu music.
   *
   * IMPORTANT: This must be called inside a user-gesture-initiated chain
   * (e.g. the change handler of a file input that was opened by a click).
   * We call `unlock()` internally so Tone.js + AudioContext are ready,
   * and we use HTML5 Audio for the actual playback because it is far more
   * forgiving than Tone.Player for arbitrary user-supplied files (no need
   * to wait for Tone.loaded(), works with any decode format the browser
   * supports, no sample-rate mismatches, no buffer-allocation failures).
   */
  async loadMenuMusicFile(file: File): Promise<boolean> {
    try {
      // Ensure audio context + masterMusic exist before doing anything else.
      if (!this.started) {
        await this.unlock();
      }

      // Revoke previous object URL to free memory
      if (this.menuMusicSource) {
        URL.revokeObjectURL(this.menuMusicSource);
        this.menuMusicSource = null;
      }

      // Tear down previous Tone.Player if any
      if (this.menuPlayer) {
        try { this.menuPlayer.stop(); } catch { /* ignore */ }
        try { this.menuPlayer.dispose(); } catch { /* ignore */ }
        this.menuPlayer = null;
      }
      // Tear down previous HTML5 audio if any
      if (this.menuHtmlAudio) {
        try { this.menuHtmlAudio.pause(); } catch { /* ignore */ }
        this.menuHtmlAudio.src = "";
        this.menuHtmlAudio = null;
      }

      const url = URL.createObjectURL(file);
      this.menuMusicSource = url;

      // Build a fresh HTML5 Audio element. We keep a reference so we can
      // play/pause/stop it later. We also route it through the Tone.js
      // masterMusic Volume node via Tone.UserMedia-like routing — but
      // simplest is to let the HTML5 element control its own volume and
      // just respect the master music volume on our side.
      const audio = new Audio();
      audio.src = url;
      audio.loop = true;
      audio.preload = "auto";
      audio.crossOrigin = "anonymous";
      // Reasonable default volume; setMusicVolume() will scale it.
      audio.volume = this.lastMusicGain;

      // Wait for the audio to be ready (or fail).
      await new Promise<void>((resolve, reject) => {
        const onCanPlay = () => {
          cleanup();
          resolve();
        };
        const onError = () => {
          cleanup();
          reject(new Error("HTML5 Audio could not decode the file"));
        };
        const cleanup = () => {
          audio.removeEventListener("canplaythrough", onCanPlay);
          audio.removeEventListener("canplay", onCanPlay);
          audio.removeEventListener("loadeddata", onCanPlay);
          audio.removeEventListener("error", onError);
        };
        audio.addEventListener("canplaythrough", onCanPlay);
        audio.addEventListener("canplay", onCanPlay);
        audio.addEventListener("loadeddata", onCanPlay);
        audio.addEventListener("error", onError);
        // Safety timeout — if it takes too long, just proceed and let
        // play() surface any error.
        setTimeout(() => {
          cleanup();
          resolve();
        }, 4000);
      });

      this.menuHtmlAudio = audio;
      this.menuMusicLoaded = true;
      return true;
    } catch (err) {
      console.error("Could not load menu music:", err);
      // Clean up any partial state
      if (this.menuMusicSource) {
        URL.revokeObjectURL(this.menuMusicSource);
        this.menuMusicSource = null;
      }
      this.menuHtmlAudio = null;
      this.menuPlayer = null;
      this.menuMusicLoaded = false;
      return false;
    }
  }

  /** Start playing the loaded menu MP3 (looping) */
  startMenuMusic() {
    if (!this.started) {
      // Defensive: someone called start before unlock. Try to unlock
      // (may not work outside a user gesture, but worth trying).
      this.unlock().then(() => this.startMenuMusic());
      return;
    }
    const audio = this.menuHtmlAudio;
    if (!audio) {
      // Fall back to Tone.Player if HTML5 audio isn't present
      if (this.menuPlayer) {
        try {
          this.menuPlayer.start();
          this.menuMusicOn = true;
        } catch (err) {
          console.warn("Menu music start (Tone) failed:", err);
        }
      }
      return;
    }
    try {
      // .play() returns a Promise that may reject if the user hasn't
      // interacted with the page yet. Catch and log.
      const p = audio.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          this.menuMusicOn = true;
        }).catch((err) => {
          console.warn("HTML5 Audio play() rejected:", err);
          // Will retry on next user gesture
        });
      } else {
        this.menuMusicOn = true;
      }
    } catch (err) {
      console.warn("Menu music start failed:", err);
    }
  }

  stopMenuMusic() {
    const audio = this.menuHtmlAudio;
    if (audio) {
      try {
        audio.pause();
      } catch { /* ignore */ }
    }
    if (this.menuPlayer) {
      try { this.menuPlayer.stop(); } catch { /* ignore */ }
    }
    this.menuMusicOn = false;
  }

  /** Fade out and remove the current menu music */
  async unloadMenuMusic() {
    const audio = this.menuHtmlAudio;
    if (audio) {
      try {
        // Quick fade then pause
        const startVol = audio.volume;
        const steps = 10;
        for (let i = steps; i >= 0; i--) {
          audio.volume = (startVol * i) / steps;
          await new Promise((r) => setTimeout(r, 40));
        }
        audio.pause();
        audio.src = "";
      } catch { /* ignore */ }
    }
    if (this.menuPlayer) {
      try {
        this.menuPlayer.fadeOut = 0.6;
        this.menuPlayer.stop("+0.6");
        await new Promise((r) => setTimeout(r, 700));
        this.menuPlayer.dispose();
      } catch { /* ignore */ }
    }
    if (this.menuMusicSource) {
      URL.revokeObjectURL(this.menuMusicSource);
    }
    this.menuHtmlAudio = null;
    this.menuPlayer = null;
    this.menuMusicLoaded = false;
    this.menuMusicOn = false;
    this.menuMusicSource = null;
  }

  get isMenuMusicLoaded() { return this.menuMusicLoaded; }
  get isMenuMusicPlaying() { return this.menuMusicOn; }
}

export const audioEngine = new AudioEngine();
