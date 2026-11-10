// Christmas Sound Engine — Web Audio API, cero archivos externos

class ChristmasAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.musicPlaying = false;
    this.musicNodes = [];   // nodos activos de la música
    this.musicScheduled = [];
    this.musicTimeout = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx?.state === 'suspended') this.ctx.resume();
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) this.stopMusic();
    return this.enabled;
  }

  // ── Oscillator helper ───────────────────────────────────
  _osc(type, freq, gainVal, startTime, duration, dest) {
    if (!this.ctx) return null;
    const osc  = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    osc.connect(gain);
    gain.connect(dest || this.ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
    return { osc, gain };
  }

  // ── Efecto bell suave ───────────────────────────────────
  playBell(freq = 1760, duration = 0.5) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      this._osc('sine', freq, 0.18, this.ctx.currentTime, duration);
      this._osc('sine', freq * 2, 0.06, this.ctx.currentTime, duration * 0.5);
    } catch {}
  }

  // ── Sparkle ascendente ──────────────────────────────────
  playSparkle() {
    if (!this.enabled) return;
    const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
    freqs.forEach((f, i) => setTimeout(() => this.playBell(f, 0.35), i * 60));
  }

  // ── Click UI ────────────────────────────────────────────
  playClick() {
    if (!this.enabled) return;
    this.playBell(880, 0.08);
  }

  // ── Jingle snippet ─────────────────────────────────────
  playJingleSnippet() {
    if (!this.enabled) return;
    const E = 659.25, G = 783.99, C = 523.25, D = 587.33;
    const notes = [
      [E,0.18],[E,0.18],[E,0.35],[E,0.18],[E,0.18],[E,0.35],
      [E,0.18],[G,0.22],[C,0.22],[D,0.22],[E,0.6],
    ];
    let t = 0;
    const gaps = [0.2,0.2,0.4,0.2,0.2,0.4,0.2,0.22,0.22,0.22,0.6];
    notes.forEach(([f, d], i) => {
      setTimeout(() => this.playBell(f, d), t * 1000);
      t += gaps[i] || 0.2;
    });
  }

  // ── Gift open ──────────────────────────────────────────
  playGiftOpen() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const bufSize = this.ctx.sampleRate * 0.25;
      const buf  = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const noise  = this.ctx.createBufferSource();
      noise.buffer = buf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(3200, this.ctx.currentTime + 0.25);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
      noise.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
      noise.start();
      setTimeout(() => this.playSparkle(), 150);
    } catch { this.playSparkle(); }
  }

  // ════════════════════════════════════════════════════════
  //  MÚSICA NAVIDEÑA SINTÉTICA — Jingle Bells completo
  // ════════════════════════════════════════════════════════
  // Notas en Hz
  static NOTES = {
    C4:261.63, D4:293.66, E4:329.63, F4:349.23, G4:392.00,
    A4:440.00, B4:493.88,
    C5:523.25, D5:587.33, E5:659.25, F5:698.46, G5:783.99,
    A5:880.00,
  };

  // Secuencia: [nota, duracion_beats]  bpm=120 → 1 beat = 0.5s
  static JINGLE_MELODY = [
    // "Jingle bells, jingle bells..."
    ['E5',1],['E5',1],['E5',2],
    ['E5',1],['E5',1],['E5',2],
    ['E5',1],['G5',1],['C5',1.5],['D5',0.5],['E5',4],
    ['F5',1],['F5',1],['F5',1.5],['F5',0.5],
    ['F5',1],['E5',1],['E5',1],['E5',0.5],['E5',0.5],
    ['E5',1],['D5',1],['D5',1],['E5',1],['D5',2],['G5',2],
    // "Jingle bells, jingle bells..."
    ['E5',1],['E5',1],['E5',2],
    ['E5',1],['E5',1],['E5',2],
    ['E5',1],['G5',1],['C5',1.5],['D5',0.5],['E5',4],
    ['F5',1],['F5',1],['F5',1.5],['F5',0.5],
    ['F5',1],['E5',1],['E5',1],['E5',0.5],['E5',0.5],
    ['G5',1],['G5',1],['F5',1],['D5',1],['C5',4],
  ];

  // Acorde de bajo sencillo cada 2 beats
  static JINGLE_BASS = [
    ['C4',2],['C4',2],['C4',2],['C4',2],
    ['F4',2],['F4',2],['C4',2],['C4',2],
    ['G4',2],['G4',2],['C4',2],['C4',2],
    ['F4',2],['F4',2],['C4',2],['G4',2],
    ['C4',2],['C4',2],['C4',2],['C4',2],
    ['F4',2],['F4',2],['C4',2],['C4',2],
    ['G4',2],['G4',2],['C4',2],['C4',2],
    ['F4',2],['G4',2],['C4',4],
  ];

  _scheduleMusic() {
    if (!this.ctx || !this.musicPlaying) return;
    const BPM   = 126;
    const beat  = 60 / BPM;
    const N     = ChristmasAudio.NOTES;

    // Master gain bajo para no molestar
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 1.5);
    masterGain.connect(this.ctx.destination);
    this.musicNodes.push(masterGain);

    // Reverb ligero (convolution simple con delay)
    const delay = this.ctx.createDelay(0.3);
    delay.delayTime.setValueAtTime(0.18, this.ctx.currentTime);
    const delayGain = this.ctx.createGain();
    delayGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    masterGain.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(masterGain);

    let t = this.ctx.currentTime + 0.1;
    let totalDuration = 0;

    // Melodía
    ChristmasAudio.JINGLE_MELODY.forEach(([noteName, beats]) => {
      const freq = N[noteName];
      const dur  = beats * beat;
      if (freq) this._osc('sine', freq, 0.4, t, dur * 0.85, masterGain);
      t += dur;
      totalDuration = Math.max(totalDuration, t - this.ctx.currentTime);
    });

    // Bajo
    let tb = this.ctx.currentTime + 0.1;
    ChristmasAudio.JINGLE_BASS.forEach(([noteName, beats]) => {
      const freq = N[noteName];
      const dur  = beats * beat;
      if (freq) this._osc('triangle', freq, 0.25, tb, dur * 0.7, masterGain);
      tb += dur;
    });

    // Loop: volver a tocar cuando termine
    const loopDelay = totalDuration * 1000 + 500;
    this.musicTimeout = setTimeout(() => {
      if (this.musicPlaying) this._scheduleMusic();
    }, loopDelay);
  }

  startMusic() {
    if (this.musicPlaying || !this.enabled) return;
    this.init();
    if (!this.ctx) return;
    this.musicPlaying = true;
    this._scheduleMusic();
  }

  stopMusic() {
    this.musicPlaying = false;
    clearTimeout(this.musicTimeout);
    // Fade out
    this.musicNodes.forEach(node => {
      try {
        if (node.gain) {
          node.gain.setValueAtTime(node.gain.value, this.ctx.currentTime);
          node.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
        }
      } catch {}
    });
    this.musicNodes = [];
  }

  toggleMusic() {
    if (this.musicPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }
}

export const sound = new ChristmasAudio();
