/* ==================================================================
   Virtual Artifact Hunt — synthesized sound effects
   Every sound is generated with the Web Audio API at runtime. No
   audio files, so nothing to license and nothing to load.
   ================================================================== */

const SOUND = (() => {
  const LS_MUTE = 'vah_muted_v1';
  let ctx = null;
  let muted = false;
  try { muted = localStorage.getItem(LS_MUTE) === '1'; } catch {}

  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone({ freq = 440, duration = 0.18, type = 'sine', gain = 0.18, delay = 0, glideTo = null }) {
    if (muted) return;
    const c = ac();
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    const t0 = c.currentTime + delay;
    osc.frequency.setValueAtTime(freq, t0);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + duration);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(g).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  return {
    isMuted: () => muted,
    setMuted(v) {
      muted = v;
      try { localStorage.setItem(LS_MUTE, v ? '1' : '0'); } catch {}
    },
    click() { tone({ freq: 520, duration: 0.06, type: 'triangle', gain: 0.12 }); },
    open() { tone({ freq: 380, duration: 0.12, type: 'sine', gain: 0.14, glideTo: 520 }); },
    found() {
      tone({ freq: 523.25, duration: 0.14, type: 'triangle', gain: 0.16 });
      tone({ freq: 659.25, duration: 0.16, type: 'triangle', gain: 0.14, delay: 0.07 });
      tone({ freq: 783.99, duration: 0.22, type: 'triangle', gain: 0.13, delay: 0.14 });
    },
    correct() {
      tone({ freq: 587.33, duration: 0.12, type: 'sine', gain: 0.16 });
      tone({ freq: 880, duration: 0.2, type: 'sine', gain: 0.15, delay: 0.09 });
    },
    wrong() {
      tone({ freq: 220, duration: 0.22, type: 'sawtooth', gain: 0.1, glideTo: 140 });
    },
    tick() { tone({ freq: 900, duration: 0.05, type: 'square', gain: 0.06 }); },
    complete() {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
        tone({ freq: f, duration: 0.3, type: 'triangle', gain: 0.15, delay: i * 0.12 }));
    },
    timeout() {
      tone({ freq: 300, duration: 0.4, type: 'sawtooth', gain: 0.1, glideTo: 90 });
    },
  };
})();
