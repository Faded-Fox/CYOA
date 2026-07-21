const ROOT = 220; // A3
const SCALE = [0, 2, 4, 5, 7, 9, 11]; // major
const CHORD_DEGREES = [0, 3, 5, 4];
const CHORD_DURATION_SEC = 10;
const FILTER_FREQ = 1400;
const FILTER_Q = 0.6;
const PAD_GAIN = 0.55;
const BEAT_INTERVAL_RANGE: [number, number] = [3.5, 6];
const BEAT_GAIN = 0.16;
const MELODY_INTERVAL_RANGE: [number, number] = [4, 9];
const MELODY_GAIN = 0.12;
const PAN_LFO_SPEED = 0.04;
const PAN_LFO_DEPTH = 0.35;

/** Semitone offsets (relative to root) for a triad built on a scale degree. */
function triad(degree: number): number[] {
  return [0, 2, 4].map((step) => {
    const idx = degree + step;
    const octave = Math.floor(idx / SCALE.length);
    return SCALE[((idx % SCALE.length) + SCALE.length) % SCALE.length] + octave * 12;
  });
}

function noteFreq(semitone: number): number {
  return ROOT * Math.pow(2, semitone / 12);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Small generative ambient engine for the title screen: a slowly shifting
 * pad chord, a soft periodic "beat" pulse, and a sparse bell-like melody
 * layer, all derived from one scale so the layers stay harmonically related.
 */
export class GenerativeMusicEngine {
  private ctx: AudioContext;
  private master: GainNode;
  private padFilter: BiquadFilterNode;
  private panner: StereoPannerNode;
  private panLfo: OscillatorNode | null = null;
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
    this.padFilter.frequency.value = FILTER_FREQ;
    this.padFilter.Q.value = FILTER_Q;
    this.padFilter.connect(this.panner);
    this.panner.connect(this.master);
    this.master.connect(destination);
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
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = PAN_LFO_SPEED;
    const depth = this.ctx.createGain();
    depth.gain.value = PAN_LFO_DEPTH;
    lfo.connect(depth);
    depth.connect(this.panner.pan);
    lfo.start();
    this.panLfo = lfo;
  }

  private scheduleChord = () => {
    if (!this.running) return;
    const degree = CHORD_DEGREES[this.chordIndex % CHORD_DEGREES.length];
    this.chordIndex += 1;
    this.currentChordDegree = degree;
    this.playChord(degree);
    this.chordTimer = window.setTimeout(
      this.scheduleChord,
      CHORD_DURATION_SEC * 1000 * 0.85,
    );
  };

  private playChord(degree: number) {
    const now = this.ctx.currentTime;
    const attack = CHORD_DURATION_SEC * 0.25;
    const release = CHORD_DURATION_SEC * 0.35;
    const hold = CHORD_DURATION_SEC - release;
    const semitones = [...triad(degree).map((s) => s - 12), ...triad(degree)];
    semitones.forEach((semitone, i) => {
      const freq = noteFreq(semitone);
      const osc = this.ctx.createOscillator();
      osc.type = i < 3 ? "sine" : "triangle";
      osc.frequency.value = freq;
      osc.detune.value = (i % 2 === 0 ? -1 : 1) * (3 + i * 2);
      const voiceGain = this.ctx.createGain();
      const peak = (PAD_GAIN / semitones.length) * (i < 3 ? 1.2 : 0.8);
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
    this.playBeat();
    const [min, max] = BEAT_INTERVAL_RANGE;
    const delay = min + Math.random() * (max - min);
    this.beatTimer = window.setTimeout(this.scheduleBeat, delay * 1000);
  };

  private playBeat() {
    const now = this.ctx.currentTime;
    const rootSemitone = triad(this.currentChordDegree)[0] - 24;
    const freq = noteFreq(rootSemitone);
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 500;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(BEAT_GAIN, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.panner);
    osc.start(now);
    osc.stop(now + 0.75);
  }

  private scheduleMelody = () => {
    if (!this.running) return;
    this.playMelodyNote();
    const [min, max] = MELODY_INTERVAL_RANGE;
    const delay = min + Math.random() * (max - min);
    this.melodyTimer = window.setTimeout(this.scheduleMelody, delay * 1000);
  };

  private playMelodyNote() {
    const now = this.ctx.currentTime;
    const chordTones = triad(this.currentChordDegree);
    const octaveUp = pick(chordTones) + 12;
    const freq = noteFreq(octaveUp);
    const osc = this.ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(MELODY_GAIN, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
    osc.connect(gain);
    gain.connect(this.panner);
    osc.start(now);
    osc.stop(now + 2.3);
  }
}
