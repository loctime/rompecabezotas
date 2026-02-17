import { useReducer, useEffect, useRef, useCallback } from 'react';
import type { GameState, GameAction, Level } from '../types';
import {
  generatePuzzlePieces,
  generateInitialGroups,
  swapPiecesOrGroups,
  checkAndMergeAdjacentGroups,
  isPuzzleComplete,
} from '../utils/puzzleLogic';

// ─── REDUCER ──────────────────────────────────────────────────────────────────

function buildInitialState(level: Level): GameState {
  const pieces = generatePuzzlePieces(level.gridSize);
  const groups = generateInitialGroups(pieces);
  return {
    pieces,
    groups,
    selectedPieceId: null,
    isComplete: false,
    moves: 0,
    startTime: Date.now(),
    elapsedTime: 0,
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INIT':
    case 'RESET':
      return buildInitialState(action.level);

    case 'SELECT_PIECE':
      return { ...state, selectedPieceId: action.pieceId };

    case 'DESELECT':
      return { ...state, selectedPieceId: null };

    case 'SWAP_AND_MERGE': {
      const { pieceId1, pieceId2, gridSize } = action;

      const { pieces: swapped, groups: swappedGroups } = swapPiecesOrGroups(
        state.pieces,
        state.groups,
        pieceId1,
        pieceId2
      );

      const { pieces: final, groups: finalGroups } = checkAndMergeAdjacentGroups(
        swapped,
        swappedGroups,
        gridSize
      );

      return {
        ...state,
        pieces: final,
        groups: finalGroups,
        selectedPieceId: null,
        moves: state.moves + 1,
        isComplete: isPuzzleComplete(final),
        elapsedTime: state.startTime ? Date.now() - state.startTime : 0,
      };
    }

    case 'TICK':
      if (state.isComplete || !state.startTime) return state;
      return { ...state, elapsedTime: action.elapsed };

    default:
      return state;
  }
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export interface UseGameStateReturn {
  pieces: GameState['pieces'];
  groups: GameState['groups'];
  selectedPieceId: GameState['selectedPieceId'];
  isComplete: GameState['isComplete'];
  moves: GameState['moves'];
  elapsedTime: GameState['elapsedTime'];
  /** For click-to-swap mode: select/deselect/swap based on selection state */
  handlePieceClick: (pieceId: number) => void;
  /** For drag-to-swap mode: directly swap two pieces, no selection state */
  handleSwap: (pieceId1: number, pieceId2: number) => void;
  resetLevel: () => void;
}

export function useGameState(level: Level): UseGameStateReturn {
  const [state, dispatch] = useReducer(gameReducer, level, buildInitialState);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Re-init when level id changes
  useEffect(() => {
    dispatch({ type: 'INIT', level });
  }, [level.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Timer
  useEffect(() => {
    if (state.isComplete) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      dispatch({ type: 'TICK', elapsed: Date.now() - (state.startTime ?? Date.now()) });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.isComplete, state.startTime]);

  // Click-based selection flow
  const handlePieceClick = useCallback(
    (pieceId: number) => {
      if (state.isComplete) return;
      if (state.selectedPieceId === null) {
        dispatch({ type: 'SELECT_PIECE', pieceId });
      } else if (state.selectedPieceId === pieceId) {
        dispatch({ type: 'DESELECT' });
      } else {
        dispatch({
          type: 'SWAP_AND_MERGE',
          pieceId1: state.selectedPieceId,
          pieceId2: pieceId,
          gridSize: level.gridSize,
        });
      }
    },
    [state.isComplete, state.selectedPieceId, level.gridSize]
  );

  // Direct swap (used by drag-and-drop — skips selection state)
  const handleSwap = useCallback(
    (pieceId1: number, pieceId2: number) => {
      if (state.isComplete) return;
      dispatch({
        type: 'SWAP_AND_MERGE',
        pieceId1,
        pieceId2,
        gridSize: level.gridSize,
      });
    },
    [state.isComplete, level.gridSize]
  );

  const resetLevel = useCallback(() => {
    dispatch({ type: 'RESET', level });
  }, [level]);

  return {
    pieces: state.pieces,
    groups: state.groups,
    selectedPieceId: state.selectedPieceId,
    isComplete: state.isComplete,
    moves: state.moves,
    elapsedTime: state.elapsedTime,
    handlePieceClick,
    handleSwap,
    resetLevel,
  };
}
