// Christmas Sound Synthesizer using Web Audio API (Zero external MP3 dependencies)

class ChristmasAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Soft sleigh bell / high chime
  playBell(freq = 1760, duration = 0.5) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      // Slight pitch vibrato
      osc.frequency.exponentialRampToValueAtTime(freq * 0.98, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio not permitted or context issue
    }
  }

  // Jingle Bells tune sequence snippet (E E E, E E E, E G C D E)
  playJingleSnippet() {
    if (!this.enabled) return;
    const notes = [
      { f: 659.25, d: 0.18, pause: 0.2 }, // E5
      { f: 659.25, d: 0.18, pause: 0.2 }, // E5
      { f: 659.25, d: 0.35, pause: 0.4 }, // E5
      { f: 659.25, d: 0.18, pause: 0.2 }, // E5
      { f: 659.25, d: 0.18, pause: 0.2 }, // E5
      { f: 659.25, d: 0.35, pause: 0.4 }, // E5
      { f: 659.25, d: 0.18, pause: 0.2 }, // E5
      { f: 783.99, d: 0.25, pause: 0.22 }, // G5
      { f: 523.25, d: 0.25, pause: 0.22 }, // C5
      { f: 587.33, d: 0.25, pause: 0.22 }, // D5
      { f: 659.25, d: 0.6, pause: 0.6 },  // E5
    ];

    let time = 0;
    notes.forEach((n) => {
      setTimeout(() => {
        this.playBell(n.f, n.d);
      }, time * 1000);
      time += n.pause;
    });
  }

  // Magical sparkle chime (ascending arpeggio)
  playSparkle() {
    if (!this.enabled) return;
    const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
    freqs.forEach((f, i) => {
      setTimeout(() => {
        this.playBell(f, 0.4);
      }, i * 65);
    });
  }

  // Gift unwrap sound (swoosh + magic chime)
  playGiftOpen() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      // White noise / rustle burst
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(3200, this.ctx.currentTime + 0.25);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();

      setTimeout(() => {
        this.playSparkle();
      }, 150);
    } catch (e) {
      this.playSparkle();
    }
  }

  // Gentle UI Click
  playClick() {
    if (!this.enabled) return;
    this.playBell(880, 0.08);
  }
}

export const sound = new ChristmasAudio();

