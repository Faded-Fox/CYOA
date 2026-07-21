export type Mood = "menu" | "light" | "night";

interface MoodConfig {
  /** Root note of the scale, in Hz. */
  root: number;
  /** Semitone offsets from the root, ascending. */
  scale: number[];
  /** Scale-degree progression the pad chords cycle through. */
  chordDegrees: number[];
  chordDurationSec: number;
  filterFreq: number;
  filterQ: number;
  padGain: number;
  beatIntervalRange: [number, number];
  beatGain: number;
  melodyIntervalRange: [number, number];
  melodyGain: number;
  panLfoSpeed: number;
  panLfoDepth: number;
}

const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const DORIAN = [0, 2, 3, 5, 7, 9, 10];

const MOODS: Record<Mood, MoodConfig> = {
  menu: {
    root: 220, // A3
    scale: MAJOR,
    chordDegrees: [0, 3, 5, 4],
    chordDurationSec: 10,
    filterFreq: 1400,
    filterQ: 0.6,
    padGain: 0.55,
    beatIntervalRange: [3.5, 6],
    beatGain: 0.16,
    melodyIntervalRange: [4, 9],
    melodyGain: 0.12,
    panLfoSpeed: 0.04,
    panLfoDepth: 0.35,
  },
  light: {
    root: 261.63, // C4
    scale: MAJOR,
    chordDegrees: [0, 4, 5, 3],
    chordDurationSec: 8,
    filterFreq: 2200,
    filterQ: 0.5,
    padGain: 0.5,
    beatIntervalRange: [2.5, 4.5],
    beatGain: 0.18,
    melodyIntervalRange: [2.5, 6],
    melodyGain: 0.15,
    panLfoSpeed: 0.06,
    panLfoDepth: 0.45,
  },
  night: {
    root: 174.61, // F3
    scale: DORIAN,
    chordDegrees: [0, 2, 5, 3],
    chordDurationSec: 13,
    filterFreq: 800,
    filterQ: 0.8,
    padGain: 0.6,
    beatIntervalRange: [5, 9],
    beatGain: 0.14,
    melodyIntervalRange: [6, 13],
    melodyGain: 0.1,
    panLfoSpeed: 0.025,
    panLfoDepth: 0.3,
  },
};

/** Semitone offsets (relative to root) for a triad built on a scale degree. */
function triad(scale: number[], degree: number): number[] {
  return [0, 2, 4].map((step) => {
    const idx = degree + step;
    const octave = Math.floor(idx / scale.length);
    return scale[((idx % scale.length) + scale.length) % scale.length] + octave * 12;
  });
}

function noteFreq(root: number, semitone: number): number {
  return root * Math.pow(2, semitone / 12);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Small generative ambient engine: a slowly shifting pad chord, a soft
 * periodic "beat" pulse, and a sparse bell-like melody layer, all derived
 * from a per-mood scale so the layers stay harmonically related.
 */
export class GenerativeMusicEngine {
  private ctx: AudioContext;
  private master: GainNode;
  private padFilter: BiquadFilterNode;
  private panner: StereoPannerNode;
  private panLfo: OscillatorNode | null = null;
  private mood: Mood = "menu";
  private running = false;
  private chordIndex = 0;
  private currentChordDegree = 0;
  private chordTimer: number | undefined;
  private beatTimer: number | undefined;
  private melodyTimer: number | undefined;

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.panner = ctx.createStereoPanner();
    this.padFilter = ctx.createBiquadFilter();
    this.padFilter.type = "lowpass";
    this.padFilter.frequency.value = MOODS.menu.filterFreq;
    this.padFilter.Q.value = MOODS.menu.filterQ;
    this.padFilter.connect(this.panner);
    this.panner.connect(this.master);
    this.master.connect(destination);
  }

  setMood(mood: Mood) {
    this.mood = mood;
    const cfg = MOODS[mood];
    const now = this.ctx.currentTime;
    this.padFilter.frequency.setTargetAtTime(cfg.filterFreq, now, 1.5);
    this.padFilter.Q.setTargetAtTime(cfg.filterQ, now, 1.5);
  }

  setVolume(target: number, rampSeconds: number) {
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(target, now + rampSeconds);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.startPanLfo();
    this.scheduleChord();
    this.scheduleBeat();
    this.scheduleMelody();
  }

  stop() {
    this.running = false;
    window.clearTimeout(this.chordTimer);
    window.clearTimeout(this.beatTimer);
    window.clearTimeout(this.melodyTimer);
    this.panLfo?.stop();
    this.panLfo = null;
  }

  private startPanLfo() {
    const cfg = MOODS[this.mood];
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = cfg.panLfoSpeed;
    const depth = this.ctx.createGain();
    depth.gain.value = cfg.panLfoDepth;
    lfo.connect(depth);
    depth.connect(this.panner.pan);
    lfo.start();
    this.panLfo = lfo;
  }

  private scheduleChord = () => {
    if (!this.running) return;
    const cfg = MOODS[this.mood];
    const degree = cfg.chordDegrees[this.chordIndex % cfg.chordDegrees.length];
    this.chordIndex += 1;
    this.currentChordDegree = degree;
    this.playChord(degree, cfg);
    this.chordTimer = window.setTimeout(
      this.scheduleChord,
      cfg.chordDurationSec * 1000 * 0.85,
    );
  };

  private playChord(degree: number, cfg: MoodConfig) {
    const now = this.ctx.currentTime;
    const attack = cfg.chordDurationSec * 0.25;
    const release = cfg.chordDurationSec * 0.35;
    const hold = cfg.chordDurationSec - release;
    const semitones = [
      ...triad(cfg.scale, degree).map((s) => s - 12),
      ...triad(cfg.scale, degree),
    ];
    semitones.forEach((semitone, i) => {
      const freq = noteFreq(cfg.root, semitone);
      const osc = this.ctx.createOscillator();
      osc.type = i < 3 ? "sine" : "triangle";
      osc.frequency.value = freq;
      osc.detune.value = (i % 2 === 0 ? -1 : 1) * (3 + i * 2);
      const voiceGain = this.ctx.createGain();
      const peak = (cfg.padGain / semitones.length) * (i < 3 ? 1.2 : 0.8);
      voiceGain.gain.setValueAtTime(0, now);
      voiceGain.gain.linearRampToValueAtTime(peak, now + attack);
      voiceGain.gain.setValueAtTime(peak, now + hold);
      voiceGain.gain.linearRampToValueAtTime(0, now + hold + release);
      osc.connect(voiceGain);
      voiceGain.connect(this.padFilter);
      osc.start(now);
      osc.stop(now + hold + release + 0.1);
    });
  }

  private scheduleBeat = () => {
    if (!this.running) return;
    const cfg = MOODS[this.mood];
    this.playBeat(cfg);
    const [min, max] = cfg.beatIntervalRange;
    const delay = min + Math.random() * (max - min);
    this.beatTimer = window.setTimeout(this.scheduleBeat, delay * 1000);
  };

  private playBeat(cfg: MoodConfig) {
    const now = this.ctx.currentTime;
    const rootSemitone = triad(cfg.scale, this.currentChordDegree)[0] - 24;
    const freq = noteFreq(cfg.root, rootSemitone);
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 500;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(cfg.beatGain, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.panner);
    osc.start(now);
    osc.stop(now + 0.75);
  }

  private scheduleMelody = () => {
    if (!this.running) return;
    const cfg = MOODS[this.mood];
    this.playMelodyNote(cfg);
    const [min, max] = cfg.melodyIntervalRange;
    const delay = min + Math.random() * (max - min);
    this.melodyTimer = window.setTimeout(this.scheduleMelody, delay * 1000);
  };

  private playMelodyNote(cfg: MoodConfig) {
    const now = this.ctx.currentTime;
    const chordTones = triad(cfg.scale, this.currentChordDegree);
    const octaveUp = pick(chordTones) + 12;
    const freq = noteFreq(cfg.root, octaveUp);
    const osc = this.ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(cfg.melodyGain, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
    osc.connect(gain);
    gain.connect(this.panner);
    osc.start(now);
    osc.stop(now + 2.3);
  }
}
