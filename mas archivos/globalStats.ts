import type { GlobalStats } from '../types';
import { getTodayISO } from './daily';

const STATS_KEY = 'jigsolitaire_v2_globalstats';

const DEFAULT_STATS: GlobalStats = {
  totalCompleted: 0,
  totalMoves: 0,
  totalTimeMs: 0,
  totalStars: 0,
  currentStreak: 0,
  lastPlayedDate: '',
  dailyCompletedDates: [],
};

// ─── READ / WRITE ─────────────────────────────────────────────────────────────

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
  } catch { /* silent */ }
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

/**
 * Call after completing any level (regular or daily).
 * isNewRecord = true if this is first completion OR better than previous best.
 */
export function recordCompletion(
  moves: number,
  timeMs: number,
  stars: number,
  isNewRecord: boolean,
  isDaily = false,
): GlobalStats {
  const stats = loadGlobalStats();
  const today = getTodayISO();

  // Streak logic: only counts if playing on consecutive days
  let newStreak = stats.currentStreak;
  if (stats.lastPlayedDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = yesterday.toISOString().split('T')[0];

    newStreak = stats.lastPlayedDate === yesterdayISO ? stats.currentStreak + 1 : 1;
  }

  const updated: GlobalStats = {
    totalCompleted: stats.totalCompleted + (isNewRecord ? 1 : 0),
    totalMoves: stats.totalMoves + moves,
    totalTimeMs: stats.totalTimeMs + timeMs,
    totalStars: isNewRecord ? stats.totalStars + stars : stats.totalStars,
    currentStreak: newStreak,
    lastPlayedDate: today,
    dailyCompletedDates: isDaily && !stats.dailyCompletedDates.includes(today)
      ? [...stats.dailyCompletedDates, today]
      : stats.dailyCompletedDates,
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
