import { useCallback, useEffect, useRef, useState } from 'react';

/** Estado mínimo para montar/desmontar el overlay. NO incluye ghostX/Y ni hoverPosition. */
export interface DragState {
  isDragging: boolean;
  draggingPieceId: number | null;
  ghostSize: number;
  ghostStartX: number;
  ghostStartY: number;
}

export interface UseDragReturn {
  dragState: DragState;
  boardRef: React.RefObject<HTMLDivElement>;
  ghostRef: React.RefObject<HTMLDivElement | null>;
  dropTargetRef: React.RefObject<HTMLDivElement | null>;
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
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const dropTargetRef = useRef<HTMLDivElement | null>(null);

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggingPieceId: null,
    ghostSize: 0,
    ghostStartX: 0,
    ghostStartY: 0,
  });

  const internal = useRef({
    active: false,
    pieceId: -1,
    startX: 0,
    startY: 0,
    movedEnough: false,
    pointerId: -1,
    dragStartNotified: false,
    boardRect: null as DOMRect | null,
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

  const updateDropTarget = useCallback(
    (position: number | null) => {
      const el = dropTargetRef.current;
      const rect = internal.current.boardRect;
      if (!el || !rect) return;

      if (position === null) {
        el.style.display = 'none';
        return;
      }

      const targetPiece = pieces.find((p) => p.currentPosition === position);
      if (!targetPiece || targetPiece.id === internal.current.pieceId) {
        el.style.display = 'none';
        return;
      }

      const cellSize = rect.width / gridSize;
      const row = Math.floor(position / gridSize);
      const col = position % gridSize;
      const left = rect.left + col * cellSize;
      const top = rect.top + row * cellSize;

      el.style.display = 'block';
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
      el.style.width = `${cellSize}px`;
      el.style.height = `${cellSize}px`;
    },
    [gridSize, pieces]
  );

  const resetDragVisual = useCallback(() => {
    setDragState((prev) =>
      prev.isDragging || prev.draggingPieceId !== null
        ? {
            isDragging: false,
            draggingPieceId: null,
            ghostSize: 0,
            ghostStartX: 0,
            ghostStartY: 0,
          }
        : prev
    );
    if (dropTargetRef.current) {
      dropTargetRef.current.style.display = 'none';
    }
  }, []);

  const onPiecePointerDown = useCallback((pieceId: number, e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    e.currentTarget.setPointerCapture(e.pointerId);

    const board = boardRef.current;
    internal.current = {
      active: true,
      pieceId,
      startX: e.clientX,
      startY: e.clientY,
      movedEnough: false,
      pointerId: e.pointerId,
      dragStartNotified: false,
      boardRect: board ? board.getBoundingClientRect() : null,
    };
  }, []);

  const startDragRef = useRef<() => void>(() => {});
  startDragRef.current = () => {
    const state = internal.current;
    if (!state.active || state.pieceId < 0) return;

    const size = getPieceSizePx();
    const startX = state.startX - size / 2;
    const startY = state.startY - size / 2;

    setDragState({
      isDragging: true,
      draggingPieceId: state.pieceId,
      ghostSize: size,
      ghostStartX: startX,
      ghostStartY: startY,
    });
  };

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
        startDragRef.current();
      }

      // ─── MOVIMIENTO VISUAL: solo DOM imperativo, cero setState ───
      const ghost = ghostRef.current;
      if (ghost) {
        ghost.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      }

      // Hit-test para drop target (ref, no state)
      const targetPos = getPositionFromPoint(e.clientX, e.clientY);
      updateDropTarget(targetPos);
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
  }, [pieces, getPositionFromPoint, getPieceSizePx, onTap, onSwap, onDragStart, resetDragVisual, updateDropTarget]);

  const isDraggingPiece = useCallback(
    (pieceId: number) => dragState.isDragging && dragState.draggingPieceId === pieceId,
    [dragState.isDragging, dragState.draggingPieceId]
  );

  return { dragState, boardRef, ghostRef, dropTargetRef, onPiecePointerDown, isDraggingPiece };
}