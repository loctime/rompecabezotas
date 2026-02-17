import type { Level, ProgressMap } from '../types';

const STORAGE_KEY = 'jigsolitaire_v2_progress';

// ─── READ ─────────────────────────────────────────────────────────────────────

function loadProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

// ─── WRITE ────────────────────────────────────────────────────────────────────

function saveProgress(map: ProgressMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Storage full or unavailable — silent fail, game still works
  }
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

/**
 * Merges the static level definitions with saved progress.
 * Never mutates LEVELS — returns a new array.
 */
export function applyProgress(baseLevels: readonly Level[]): Level[] {
  const progress = loadProgress();

  return baseLevels.map((level) => {
    const stats = progress[level.id];
    if (!stats) return { ...level };
    return {
      ...level,
      completed: stats.completed,
      bestMoves: stats.bestMoves,
      bestTime: stats.bestTime,
    };
  });
}

/**
 * Applies unlock logic: a level is unlocked if id===1
 * or the previous level is completed.
 */
export function applyUnlocks(levels: Level[]): Level[] {
  const completedIds = new Set(levels.filter((l) => l.completed).map((l) => l.id));
  return levels.map((level) => ({
    ...level,
    unlocked: level.id === 1 || completedIds.has(level.id - 1),
  }));
}

/** Call after winning a level. Returns updated levels array. */
export function recordLevelComplete(
  levels: Level[],
  levelId: number,
  moves: number,
  timeMs: number
): Level[] {
  const progress = loadProgress();
  const existing = progress[levelId];

  progress[levelId] = {
    completed: true,
    bestMoves: existing ? Math.min(existing.bestMoves, moves) : moves,
    bestTime: existing ? Math.min(existing.bestTime, timeMs) : timeMs,
  };

  saveProgress(progress);

  // Return updated levels (with unlocks recalculated)
  const updated = levels.map((l) => {
    if (l.id !== levelId) return l;
    return {
      ...l,
      completed: true,
      bestMoves: progress[levelId].bestMoves,
      bestTime: progress[levelId].bestTime,
    };
  });

  return applyUnlocks(updated);
}

/** Wipe all progress (for dev/debug or "reset game" feature) */
export function resetAllProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}
