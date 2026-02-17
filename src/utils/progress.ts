import type { Level, ProgressMap } from '../types';
import { calculateStars } from './stars';

const STORAGE_KEY = 'jigsolitaire_v2_progress';

function loadProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

function saveProgress(map: ProgressMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Storage full or unavailable — silent fail
  }
}

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
      stars: stats.stars,
    };
  });
}

export function applyUnlocks(levels: Level[]): Level[] {
  const completedIds = new Set(levels.filter((l) => l.completed).map((l) => l.id));
  return levels.map((level) => ({
    ...level,
    unlocked: level.id === 1 || completedIds.has(level.id - 1),
  }));
}

export function recordLevelComplete(
  levels: Level[],
  levelId: number,
  moves: number,
  timeMs: number,
  gridSize: number
): { levels: Level[]; stars: number; isNewRecord: boolean; previousBestMoves?: number } {
  const progress = loadProgress();
  const existing = progress[levelId];
  const starsEarned = calculateStars(moves, gridSize);

  const isNewRecord =
    !existing ||
    moves < existing.bestMoves ||
    starsEarned > (existing.stars ?? 0);

  progress[levelId] = {
    completed: true,
    bestMoves: existing ? Math.min(existing.bestMoves, moves) : moves,
    bestTime: existing ? Math.min(existing.bestTime, timeMs) : timeMs,
    stars: existing ? Math.max(existing.stars ?? 0, starsEarned) : starsEarned,
  };

  saveProgress(progress);

  const updated = levels.map((l) => {
    if (l.id !== levelId) return l;
    return {
      ...l,
      completed: true,
      bestMoves: progress[levelId].bestMoves,
      bestTime: progress[levelId].bestTime,
      stars: progress[levelId].stars,
    };
  });

  return {
    levels: applyUnlocks(updated),
    stars: starsEarned,
    isNewRecord,
    previousBestMoves: existing?.bestMoves,
  };
}

export function resetAllProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}
