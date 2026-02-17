import type { GlobalStats } from '../types';
import { getTodayISO } from './daily';

const STATS_KEY = 'jigsolitaire_v2_globalstats';

const DEFAULT_STATS: GlobalStats = {
  totalCompleted: 0,
  totalMoves: 0,
  totalTimeMs: 0,
  currentStreak: 0,
  lastDailyCompletedDate: '',
};

export function loadGlobalStats(): GlobalStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? { ...DEFAULT_STATS, ...(JSON.parse(raw) as Partial<GlobalStats>) } : { ...DEFAULT_STATS };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

function saveGlobalStats(stats: GlobalStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore storage failures
  }
}

function getYesterdayISO(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

export function recordCompletion(moves: number, timeMs: number): GlobalStats {
  const stats = loadGlobalStats();
  const updated: GlobalStats = {
    ...stats,
    totalCompleted: stats.totalCompleted + 1,
    totalMoves: stats.totalMoves + moves,
    totalTimeMs: stats.totalTimeMs + timeMs,
  };

  saveGlobalStats(updated);
  return updated;
}

export function recordDailyCompletion(): GlobalStats {
  const stats = loadGlobalStats();
  const today = getTodayISO();

  if (stats.lastDailyCompletedDate === today) {
    return stats;
  }

  const yesterday = getYesterdayISO();
  const streak = stats.lastDailyCompletedDate === yesterday ? stats.currentStreak + 1 : 1;

  const updated: GlobalStats = {
    ...stats,
    currentStreak: streak,
    lastDailyCompletedDate: today,
  };

  saveGlobalStats(updated);
  return updated;
}

export function formatTotalTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
