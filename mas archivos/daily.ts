import type { DailyChallenge } from '../types';
import { LEVELS } from '../data/levels';

const DAILY_KEY = 'jigsolitaire_v2_daily';

// ─── DATE UTILS ───────────────────────────────────────────────────────────────

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Deterministic daily level selection.
 * Uses a simple hash of the date string to pick a level index.
 * Same date always → same level, regardless of device.
 */
function dateToLevelId(dateStr: string): number {
  // Hash: sum of char codes, biased by position
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0; // unsigned 32-bit
  }
  // Use only completed (unlockable) levels — all 30
  const idx = hash % LEVELS.length;
  return LEVELS[idx].id;
}

// ─── STORAGE ──────────────────────────────────────────────────────────────────

function loadDaily(): DailyChallenge | null {
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    return raw ? (JSON.parse(raw) as DailyChallenge) : null;
  } catch {
    return null;
  }
}

function saveDaily(daily: DailyChallenge): void {
  try {
    localStorage.setItem(DAILY_KEY, JSON.stringify(daily));
  } catch { /* silent */ }
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

/** Returns today's daily challenge state */
export function getTodayChallenge(): DailyChallenge {
  const today = getTodayISO();
  const saved = loadDaily();

  // If saved data is for today, return it (preserves completed state)
  if (saved && saved.date === today) return saved;

  // New day → new challenge
  const newChallenge: DailyChallenge = {
    date: today,
    levelId: dateToLevelId(today),
    completed: false,
  };
  saveDaily(newChallenge);
  return newChallenge;
}

/** Mark today's daily as completed */
export function completeTodayChallenge(): void {
  const today = getTodayISO();
  const current = loadDaily();
  if (current && current.date === today) {
    saveDaily({ ...current, completed: true });
  }
}

/** Has the user already completed today's daily? */
export function isDailyCompleted(): boolean {
  const saved = loadDaily();
  return saved?.date === getTodayISO() && saved.completed === true;
}
