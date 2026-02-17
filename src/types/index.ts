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
  stars?: number;
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
  | { type: 'MOVE_GROUP'; groupId: number; targetPosition: number; gridSize: number }
  | { type: 'COMPLETE' }
  | { type: 'RESET'; level: Level }
  | { type: 'TICK'; elapsed: number };

// ─── PROGRESS ─────────────────────────────────────────────────────────────────

export interface LevelStats {
  completed: boolean;
  bestMoves: number;
  bestTime: number;
  stars?: number;
}

export type ProgressMap = Record<number, LevelStats>;

export interface DailyChallenge {
  date: string;
  levelId: number;
  completed: boolean;
}

export interface GlobalStats {
  totalCompleted: number;
  totalMoves: number;
  totalTimeMs: number;
  currentStreak: number;
  lastDailyCompletedDate: string;
}

// ─── UI ───────────────────────────────────────────────────────────────────────

export type Screen = 'selector' | 'game';

export interface AppState {
  screen: Screen;
  currentLevel: Level | null;
}
