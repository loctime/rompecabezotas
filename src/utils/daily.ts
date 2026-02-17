import type { DailyChallenge } from '../types';
import { LEVELS } from '../data/levels';

const DAILY_KEY = 'jigsolitaire_v2_daily';

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function dateToLevelId(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i += 1) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  return LEVELS[hash % LEVELS.length].id;
}

function loadDaily(): DailyChallenge | null {
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    return raw ? (JSON.parse(raw) as DailyChallenge) : null;
  } catch {
    return null;
  }
}

function saveDaily(challenge: DailyChallenge): void {
  try {
    localStorage.setItem(DAILY_KEY, JSON.stringify(challenge));
  } catch {
    // ignore storage failures
  }
}

export function getTodayChallenge(): DailyChallenge {
  const today = getTodayISO();
  const saved = loadDaily();
  if (saved?.date === today) return saved;

  const challenge: DailyChallenge = {
    date: today,
    levelId: dateToLevelId(today),
    completed: false,
  };

  saveDaily(challenge);
  return challenge;
}

export function completeTodayChallenge(): void {
  const today = getTodayISO();
  const saved = loadDaily();
  if (saved?.date === today && !saved.completed) {
    saveDaily({ ...saved, completed: true });
  }
}
