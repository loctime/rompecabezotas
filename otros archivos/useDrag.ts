import { useRef, useCallback, useEffect, useState } from 'react';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface DragState {
  isDragging: boolean;
  draggingPieceId: number | null;
  ghostX: number;   // px from viewport left
  ghostY: number;   // px from viewport top
  ghostSize: number; // px — matches actual piece size on screen
}

export interface UseDragReturn {
  dragState: DragState;
  /** Attach to the board container div */
  boardRef: React.RefObject<HTMLDivElement>;
  /** Call from each piece's onPointerDown */
  onPiecePointerDown: (pieceId: number, e: React.PointerEvent) => void;
  /** Whether a given piece is currently being dragged */
  isDraggingPiece: (pieceId: number) => boolean;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const DRAG_THRESHOLD_PX = 6; // less than this = treat as click/tap

// ─── HOOK ─────────────────────────────────────────────────────────────────────

/**
 * Handles drag & drop via Pointer Events API.
 * Works with mouse, touch (iOS/Android), and stylus.
 *
 * Flow:
 *  pointerdown on piece → start tracking
 *  pointermove          → if moved > threshold, enter drag mode; update ghost position
 *  pointerup on board   → hit-test which cell the pointer is over → trigger swap
 *  pointerup short      → treat as click → trigger onPieceClick
 */
export function useDrag(
  pieces: Array<{ id: number; currentPosition: number }>,
  gridSize: number,
  onPieceClick: (id: number) => void,
  onSwap: (pieceId1: number, pieceId2: number) => void,
): UseDragReturn {
  const boardRef = useRef<HTMLDivElement>(null);

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggingPieceId: null,
    ghostX: 0,
    ghostY: 0,
    ghostSize: 0,
  });

  // Internal mutable state (not React state — avoids re-renders during move)
  const internal = useRef({
    active: false,
    pieceId: -1,
    startX: 0,
    startY: 0,
    movedEnough: false,
    pointerId: -1,
  });

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const getPieceSizePx = useCallback((): number => {
    const board = boardRef.current;
    if (!board) return 0;
    return board.getBoundingClientRect().width / gridSize;
  }, [gridSize]);

  /**
   * Given a viewport coordinate, returns the grid position (0-based index)
   * or null if outside the board.
   */
  const getPositionFromPoint = useCallback((clientX: number, clientY: number): number | null => {
    const board = boardRef.current;
    if (!board) return null;

    const rect = board.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    if (relX < 0 || relY < 0 || relX > rect.width || relY > rect.height) return null;

    const col = Math.floor((relX / rect.width) * gridSize);
    const row = Math.floor((relY / rect.height) * gridSize);

    const clampedCol = Math.max(0, Math.min(gridSize - 1, col));
    const clampedRow = Math.max(0, Math.min(gridSize - 1, row));

    return clampedRow * gridSize + clampedCol;
  }, [gridSize]);

  // ── Event handlers ───────────────────────────────────────────────────────────

  const onPiecePointerDown = useCallback((pieceId: number, e: React.PointerEvent) => {
    // Only primary button (left click or first touch)
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    e.currentTarget.setPointerCapture(e.pointerId);

    internal.current = {
      active: true,
      pieceId,
      startX: e.clientX,
      startY: e.clientY,
      movedEnough: false,
      pointerId: e.pointerId,
    };
  }, []);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const state = internal.current;
      if (!state.active || e.pointerId !== state.pointerId) return;

      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (!state.movedEnough) {
        if (dist < DRAG_THRESHOLD_PX) return;
        state.movedEnough = true;
      }

      const size = getPieceSizePx();

      setDragState({
        isDragging: true,
        draggingPieceId: state.pieceId,
        ghostX: e.clientX - size / 2,
        ghostY: e.clientY - size / 2,
        ghostSize: size,
      });
    };

    const handlePointerUp = (e: PointerEvent) => {
      const state = internal.current;
      if (!state.active || e.pointerId !== state.pointerId) return;

      // Reset drag visual immediately
      setDragState({
        isDragging: false,
        draggingPieceId: null,
        ghostX: 0,
        ghostY: 0,
        ghostSize: 0,
      });

      if (!state.movedEnough) {
        // Short movement → treat as click
        onPieceClick(state.pieceId);
      } else {
        // Drag ended — find target cell
        const targetPos = getPositionFromPoint(e.clientX, e.clientY);
        if (targetPos !== null) {
          const targetPiece = pieces.find((p) => p.currentPosition === targetPos);
          if (targetPiece && targetPiece.id !== state.pieceId) {
            onSwap(state.pieceId, targetPiece.id);
          }
        }
      }

      internal.current.active = false;
    };

    const handlePointerCancel = () => {
      internal.current.active = false;
      setDragState({
        isDragging: false,
        draggingPieceId: null,
        ghostX: 0,
        ghostY: 0,
        ghostSize: 0,
      });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, [pieces, getPieceSizePx, getPositionFromPoint, onPieceClick, onSwap]);

  const isDraggingPiece = useCallback(
    (pieceId: number) => dragState.isDragging && dragState.draggingPieceId === pieceId,
    [dragState]
  );

  return { dragState, boardRef, onPiecePointerDown, isDraggingPiece };
}
