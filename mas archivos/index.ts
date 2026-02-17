// ─── DOMAIN TYPES ─────────────────────────────────────────────────────────────

export interface PuzzlePiece {
  id: number;
  correctPosition: number;
  currentPosition: number;
  groupId: number;
  row: number;
  col: number;
}

export interface PieceGroup {
  id: number;
  pieceIds: number[];
  positions: number[];
}

export interface Level {
  id: number;
  title: string;
  imageUrl: string;
  gridSize: number;
  unlocked: boolean;
  completed: boolean;
  bestMoves?: number;
  bestTime?: number;
  stars?: number; // 1 | 2 | 3 — best star rating achieved
}

// ─── GAME STATE ────────────────────────────────────────────────────────────────

export interface GameState {
  pieces: PuzzlePiece[];
  groups: PieceGroup[];
  selectedPieceId: number | null;
  isComplete: boolean;
  moves: number;
  startTime: number | null;
  elapsedTime: number;
}

export type GameAction =
  | { type: 'INIT'; level: Level }
  | { type: 'SELECT_PIECE'; pieceId: number }
  | { type: 'DESELECT' }
  | { type: 'SWAP_AND_MERGE'; pieceId1: number; pieceId2: number; gridSize: number }
  | { type: 'COMPLETE' }
  | { type: 'RESET'; level: Level }
  | { type: 'TICK'; elapsed: number };

// ─── PROGRESS ─────────────────────────────────────────────────────────────────

export interface LevelStats {
  completed: boolean;
  bestMoves: number;
  bestTime: number;
  stars: number; // 1 | 2 | 3
}

export type ProgressMap = Record<number, LevelStats>;

// ─── GLOBAL STATS ─────────────────────────────────────────────────────────────

export interface GlobalStats {
  totalCompleted: number;
  totalMoves: number;
  totalTimeMs: number;
  totalStars: number;
  currentStreak: number; // consecutive days played
  lastPlayedDate: string; // ISO date string YYYY-MM-DD
  dailyCompletedDates: string[]; // list of dates where daily was completed
}

// ─── DAILY CHALLENGE ──────────────────────────────────────────────────────────

export interface DailyChallenge {
  date: string;       // YYYY-MM-DD
  levelId: number;    // which level is the daily
  completed: boolean;
}

// ─── UI ───────────────────────────────────────────────────────────────────────

export type Screen = 'selector' | 'game' | 'daily';

export interface AppState {
  screen: Screen;
  currentLevel: Level | null;
}
