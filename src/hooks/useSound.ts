import { useCallback, useEffect, useMemo, useState } from 'react';

export type SoundType = 'select' | 'swap' | 'merge' | 'victory';

const STORAGE_KEY = 'jigsolitaire:sound-enabled';

let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!sharedCtx) {
    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    sharedCtx = new AudioCtx();
  }

  return sharedCtx;
}

function readInitialEnabled(initialEnabled: boolean): boolean {
  if (typeof window === 'undefined') return initialEnabled;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === null) return initialEnabled;
  return stored === 'true';
}

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

function playMerge(ctx: AudioContext) {
  const now = ctx.currentTime;
  const notes = [523, 659, 784];

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

function playVictory(ctx: AudioContext) {
  const now = ctx.currentTime;
  const melody = [
    { freq: 523, t: 0, dur: 0.18 },
    { freq: 659, t: 0.14, dur: 0.18 },
    { freq: 784, t: 0.28, dur: 0.18 },
    { freq: 1047, t: 0.42, dur: 0.28 },
    { freq: 1319, t: 0.62, dur: 0.5 },
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

export interface UseSoundReturn {
  play: (sound: SoundType) => void;
  enabled: boolean;
  toggle: () => void;
}

export function useSound(initialEnabled = true): UseSoundReturn {
  const [enabled, setEnabled] = useState(() => readInitialEnabled(initialEnabled));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled]);

  useEffect(() => {
    const resume = () => {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        void ctx.resume();
      }
    };

    window.addEventListener('pointerdown', resume, { once: true });
    return () => window.removeEventListener('pointerdown', resume);
  }, []);

  const soundPlayerMap = useMemo(
    () => ({
      select: playSelect,
      swap: playSwap,
      merge: playMerge,
      victory: playVictory,
    }),
    []
  );

  const play = useCallback(
    (sound: SoundType) => {
      if (!enabled) return;

      const ctx = getAudioContext();
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        void ctx.resume();
      }

      try {
        soundPlayerMap[sound](ctx);
      } catch {
        // silent fail
      }
    },
    [enabled, soundPlayerMap]
  );

  const toggle = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  return { play, enabled, toggle };
}
