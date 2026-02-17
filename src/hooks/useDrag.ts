import { useCallback, useEffect, useRef, useState } from 'react';

export interface DragState {
  isDragging: boolean;
  draggingPieceId: number | null;
  ghostX: number;
  ghostY: number;
  ghostSize: number;
  hoverPosition: number | null;
}

export interface UseDragReturn {
  dragState: DragState;
  boardRef: React.RefObject<HTMLDivElement>;
  onPiecePointerDown: (pieceId: number, e: React.PointerEvent<HTMLButtonElement>) => void;
  isDraggingPiece: (pieceId: number) => boolean;
}

const DRAG_THRESHOLD_PX = 6;

interface PieceLike {
  id: number;
  currentPosition: number;
}

export function useDrag(
  pieces: PieceLike[],
  gridSize: number,
  onTap: (id: number) => void,
  onSwap: (pieceId1: number, pieceId2: number) => void,
  onDragStart?: () => void
): UseDragReturn {
  const boardRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggingPieceId: null,
    ghostX: 0,
    ghostY: 0,
    ghostSize: 0,
    hoverPosition: null,
  });

  const internal = useRef({
    active: false,
    pieceId: -1,
    startX: 0,
    startY: 0,
    movedEnough: false,
    pointerId: -1,
    dragStartNotified: false,
  });

  const getPieceSizePx = useCallback((): number => {
    const board = boardRef.current;
    if (!board) return 0;
    return board.getBoundingClientRect().width / gridSize;
  }, [gridSize]);

  const getPositionFromPoint = useCallback(
    (clientX: number, clientY: number): number | null => {
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
    },
    [gridSize]
  );

  const resetDragVisual = useCallback(() => {
    setDragState((prev) =>
      prev.isDragging || prev.draggingPieceId !== null || prev.hoverPosition !== null
        ? {
            isDragging: false,
            draggingPieceId: null,
            ghostX: 0,
            ghostY: 0,
            ghostSize: 0,
            hoverPosition: null,
          }
        : prev
    );
  }, []);

  const onPiecePointerDown = useCallback((pieceId: number, e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    e.currentTarget.setPointerCapture(e.pointerId);

    internal.current = {
      active: true,
      pieceId,
      startX: e.clientX,
      startY: e.clientY,
      movedEnough: false,
      pointerId: e.pointerId,
      dragStartNotified: false,
    };
  }, []);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const state = internal.current;
      if (!state.active || e.pointerId !== state.pointerId) return;

      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;
      const dist = Math.hypot(dx, dy);

      if (!state.movedEnough) {
        if (dist < DRAG_THRESHOLD_PX) return;
        state.movedEnough = true;

        if (!state.dragStartNotified) {
          onDragStart?.();
          state.dragStartNotified = true;
        }
      }

      const size = getPieceSizePx();
      const hoverPosition = getPositionFromPoint(e.clientX, e.clientY);

      setDragState((prev) => ({
        isDragging: true,
        draggingPieceId: state.pieceId,
        ghostX: e.clientX - size / 2,
        ghostY: e.clientY - size / 2,
        ghostSize: size,
        hoverPosition: prev.hoverPosition === hoverPosition ? prev.hoverPosition : hoverPosition,
      }));
    };

    const handlePointerUp = (e: PointerEvent) => {
      const state = internal.current;
      if (!state.active || e.pointerId !== state.pointerId) return;

      if (!state.movedEnough) {
        onTap(state.pieceId);
      } else {
        const targetPos = getPositionFromPoint(e.clientX, e.clientY);
        if (targetPos !== null) {
          const targetPiece = pieces.find((p) => p.currentPosition === targetPos);
          if (targetPiece && targetPiece.id !== state.pieceId) {
            onSwap(state.pieceId, targetPiece.id);
          }
        }
      }

      resetDragVisual();
      internal.current.active = false;
    };

    const handlePointerCancel = (e: PointerEvent) => {
      const state = internal.current;
      if (!state.active || e.pointerId !== state.pointerId) return;
      internal.current.active = false;
      resetDragVisual();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, [pieces, getPieceSizePx, getPositionFromPoint, onTap, onSwap, onDragStart, resetDragVisual]);

  const isDraggingPiece = useCallback(
    (pieceId: number) => dragState.isDragging && dragState.draggingPieceId === pieceId,
    [dragState.isDragging, dragState.draggingPieceId]
  );

  return { dragState, boardRef, onPiecePointerDown, isDraggingPiece };
}
