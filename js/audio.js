/* ============================================================
   audio.js
   Sonido ambiente generado por síntesis (Web Audio API), sin
   depender de archivos externos: un acorde suave tipo "pad" más
   pequeños destellos de campanitas aleatorias.
   ============================================================ */

(function (global) {
  'use strict';

  function AmbientAudio() {
    this.ctx = null;
    this.playing = false;
    this.nodes = [];
    this.masterGain = null;
    this.chimeTimer = null;
  }

  AmbientAudio.prototype.ensureContext = function () {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  };

  AmbientAudio.prototype.start = function () {
    const ctx = this.ensureContext();
    if (!ctx || this.playing) return;
    this.playing = true;

    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(ctx.destination);
    this.masterGain.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 2.2);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 950;
    filter.connect(this.masterGain);

    // acorde cálido (C-E-G-B suave) con osciladores suaves
    const freqs = [261.63, 329.63, 392.0, 493.88 * 0.5];
    freqs.forEach((f) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.5 / freqs.length;
      osc.connect(g);
      g.connect(filter);
      osc.start();
      this.nodes.push(osc);
    });

    // LFO lento que respira sobre el filtro, da sensación "viva"
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 260;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    this.nodes.push(lfo);
    this.filterNode = filter;

    this._scheduleChime();
  };

  AmbientAudio.prototype._scheduleChime = function () {
    if (!this.playing) return;
    const delay = 2800 + Math.random() * 4200;
    this.chimeTimer = setTimeout(() => {
      this._playChime();
      this._scheduleChime();
    }, delay);
  };

  AmbientAudio.prototype._playChime = function () {
    if (!this.playing || !this.ctx) return;
    const ctx = this.ctx;
    const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 987.77];
    const freq = notes[Math.floor(Math.random() * notes.length)];
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = 0.0001;
    osc.connect(g);
    g.connect(this.masterGain);
    const t = ctx.currentTime;
    g.gain.exponentialRampToValueAtTime(0.13, t + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
    osc.start(t);
    osc.stop(t + 2.5);
  };

  AmbientAudio.prototype.stop = function () {
    if (!this.playing) return;
    this.playing = false;
    clearTimeout(this.chimeTimer);
    const ctx = this.ctx;
    if (this.masterGain && ctx) {
      this.masterGain.gain.cancelScheduledValues(ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.7);
    }
    const nodesToStop = this.nodes;
    this.nodes = [];
    setTimeout(() => {
      nodesToStop.forEach((n) => {
        try { n.stop(); } catch (e) { /* noop */ }
      });
    }, 800);
  };

  AmbientAudio.prototype.toggle = function () {
    if (this.playing) this.stop();
    else this.start();
    return this.playing;
  };

  global.AmbientAudio = AmbientAudio;
}(window));
