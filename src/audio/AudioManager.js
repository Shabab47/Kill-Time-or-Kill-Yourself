const builtInSounds = {
  shoot: { type: 'triangle', freq: [400, 150], dur: 0.08, gain: 0.06 },
  slash: { type: 'sawtooth', freq: [700, 180], dur: 0.09, gain: 0.07 },
  hit: { type: 'sawtooth', freq: [100, 30], dur: 0.12, gain: 0.06 },
  kill: { type: 'sawtooth', freq: [300, 600], dur: 0.08, gain: 0.06 },
  xp: { type: 'triangle', freq: [600, 900], dur: 0.06, gain: 0.06 },
  levelup: { type: 'sine', freq: [523, 622, 784], dur: 0.35, gain: 0.08 },
  dash: { type: 'sawtooth', freq: [200, 500], dur: 0.15, gain: 0.06 },
  explosion: { type: 'sawtooth', freq: [60, 15], dur: 0.3, gain: 0.1 },
};

class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }
  init() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }
  }
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
  play(name) {
    if (!this.enabled || !this.ctx) return;
    const config = (window.soundRegistry && window.soundRegistry[name]) || builtInSounds[name];
    if (!config) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      const now = this.ctx.currentTime;
      const { type = 'sine', freq, dur, gain: g = 0.06 } = config;
      osc.type = type;
      gain.gain.setValueAtTime(g, now);
      if (freq.length === 2) {
        osc.frequency.setValueAtTime(freq[0], now);
        osc.frequency.exponentialRampToValueAtTime(Math.max(freq[1], 1), now + dur);
      } else if (freq.length === 3) {
        const mid = now + dur * 0.4;
        osc.frequency.setValueAtTime(freq[0], now);
        osc.frequency.exponentialRampToValueAtTime(freq[1], mid);
        osc.frequency.setValueAtTime(freq[1], mid);
        osc.frequency.exponentialRampToValueAtTime(Math.max(freq[2], 1), now + dur);
      }
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      osc.start(now);
      osc.stop(now + dur + 0.01);
    } catch (e) {}
  }
}
const audio = new AudioManager();
