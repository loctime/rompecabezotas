import { useRef, useCallback, useEffect } from 'react';

// ─── AUDIO CONTEXT (lazy singleton) ──────────────────────────────────────────

let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedCtx) {
    sharedCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return sharedCtx;
}

// ─── SOUND GENERATORS ────────────────────────────────────────────────────────

/**
 * Soft "click" — piece select
 * Short sine pop, low frequency, gentle envelope
 */
function playSelect(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(420, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.08);

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.12);
}

/**
 * Soft "swap" — two pieces exchanged
 * Two quick tones, ascending
 */
function playSwap(ctx: AudioContext) {
  const now = ctx.currentTime;

  const playTone = (freq: number, startTime: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.1, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  playTone(280, now, 0.1);
  playTone(380, now + 0.06, 0.12);
}

/**
 * "Merge" chime — pieces snap together
 * Bright major chord arpeggio, satisfying
 */
function playMerge(ctx: AudioContext) {
  const now = ctx.currentTime;
  const notes = [523, 659, 784]; // C5, E5, G5 — major triad

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 2, now);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.05);

    const t = now + i * 0.05;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.start(t);
    osc.stop(t + 0.4);
  });
}

/**
 * "Victory" fanfare — puzzle complete
 * Ascending 5-note melody, warm and celebratory
 */
function playVictory(ctx: AudioContext) {
  const now = ctx.currentTime;
  // C5 E5 G5 E6 C6 — triumphant arpeggio
  const melody = [
    { freq: 523, t: 0,    dur: 0.18 },
    { freq: 659, t: 0.14, dur: 0.18 },
    { freq: 784, t: 0.28, dur: 0.18 },
    { freq: 1047, t: 0.42, dur: 0.28 },
    { freq: 1319, t: 0.62, dur: 0.5  },
  ];

  melody.forEach(({ freq, t, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + t);

    gain.gain.setValueAtTime(0, now + t);
    gain.gain.linearRampToValueAtTime(0.2, now + t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + t + dur);

    osc.start(now + t);
    osc.stop(now + t + dur);
  });
}

/**
 * Soft "deselect" — cancel selection
 */
function playDeselect(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(380, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.1);

  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export type SoundType = 'select' | 'deselect' | 'swap' | 'merge' | 'victory';

export interface UseSoundReturn {
  play: (sound: SoundType) => void;
  enabled: boolean;
  toggle: () => void;
}

export function useSound(initialEnabled = true): UseSoundReturn {
  const enabledRef = useRef(initialEnabled);
  const resumedRef = useRef(false);

  // Resume AudioContext on first user interaction (required by browsers)
  useEffect(() => {
    const resume = () => {
      if (resumedRef.current) return;
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
        resumedRef.current = true;
      }
    };
    window.addEventListener('pointerdown', resume, { once: true });
    return () => window.removeEventListener('pointerdown', resume);
  }, []);

  const play = useCallback((sound: SoundType) => {
    if (!enabledRef.current) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      switch (sound) {
        case 'select':   playSelect(ctx);   break;
        case 'deselect': playDeselect(ctx); break;
        case 'swap':     playSwap(ctx);     break;
        case 'merge':    playMerge(ctx);    break;
        case 'victory':  playVictory(ctx);  break;
      }
    } catch {
      // Audio errors are non-fatal — silent fail
    }
  }, []);

  const toggle = useCallback(() => {
    enabledRef.current = !enabledRef.current;
  }, []);

  return { play, enabled: enabledRef.current, toggle };
}
