import { useCallback, useEffect, useRef, useState } from 'react';
import type { PieceGroup } from '../types';

interface GroupBoundingBox {
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
}

export interface DragState {
  isDragging: boolean;
  draggingPieceId: number | null;
  draggingGroupId: number | null;
  groupBoundingBox: GroupBoundingBox | null;
  ghostBoardX: number;
  ghostBoardY: number;
  ghostWidth: number;
  ghostHeight: number;
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
  groupId: number;
}

export function useDrag(
  pieces: PieceLike[],
  groups: PieceGroup[],
  gridSize: number,
  onTap: (id: number) => void,
  _onSwap: (pieceId1: number, pieceId2: number) => void,
  onDropGroup: (groupId: number, targetPosition: number) => void,
  onDragStart?: () => void
): UseDragReturn {
  const boardRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const dropTargetRef = useRef<HTMLDivElement | null>(null);

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggingPieceId: null,
    draggingGroupId: null,
    groupBoundingBox: null,
    ghostBoardX: 0,
    ghostBoardY: 0,
    ghostWidth: 0,
    ghostHeight: 0,
  });

  const internal = useRef({
    active: false,
    movedEnough: false,
    dragStarted: false,
    pointerId: -1,
    pieceId: -1,
    groupId: -1,
    startClientX: 0,
    startClientY: 0,
    boardRect: null as DOMRect | null,
    cellWidth: 0,
    cellHeight: 0,
    bbox: null as GroupBoundingBox | null,
    pointerOffsetX: 0,
    pointerOffsetY: 0,
    lastGhostX: 0,
    lastGhostY: 0,
  });

  const resetVisuals = useCallback(() => {
    setDragState({
      isDragging: false,
      draggingPieceId: null,
      draggingGroupId: null,
      groupBoundingBox: null,
      ghostBoardX: 0,
      ghostBoardY: 0,
      ghostWidth: 0,
      ghostHeight: 0,
    });

    if (dropTargetRef.current) {
      dropTargetRef.current.style.display = 'none';
    }
  }, []);

  const getGroupBoundingBox = useCallback(
    (groupId: number): GroupBoundingBox | null => {
      const group = groups.find((g) => g.id === groupId);
      if (!group) return null;

      const groupPieces = group.pieceIds
        .map((id) => pieces.find((p) => p.id === id))
        .filter((p): p is PieceLike => Boolean(p));

      if (groupPieces.length === 0) return null;

      const rows = groupPieces.map((p) => Math.floor(p.currentPosition / gridSize));
      const cols = groupPieces.map((p) => p.currentPosition % gridSize);

      return {
        minRow: Math.min(...rows),
        maxRow: Math.max(...rows),
        minCol: Math.min(...cols),
        maxCol: Math.max(...cols),
      };
    },
    [groups, pieces, gridSize]
  );

  const updateDropTarget = useCallback(
    (anchorRow: number, anchorCol: number) => {
      const state = internal.current;
      const el = dropTargetRef.current;
      if (!el || !state.bbox) return;

      const bboxRows = state.bbox.maxRow - state.bbox.minRow + 1;
      const bboxCols = state.bbox.maxCol - state.bbox.minCol + 1;
      const maxRow = Math.max(0, gridSize - bboxRows);
      const maxCol = Math.max(0, gridSize - bboxCols);

      const clampedRow = Math.max(0, Math.min(maxRow, anchorRow));
      const clampedCol = Math.max(0, Math.min(maxCol, anchorCol));

      el.style.display = 'block';
      el.style.left = `${clampedCol * state.cellWidth}px`;
      el.style.top = `${clampedRow * state.cellHeight}px`;
      el.style.width = `${bboxCols * state.cellWidth}px`;
      el.style.height = `${bboxRows * state.cellHeight}px`;
    },
    [gridSize]
  );

  const onPiecePointerDown = useCallback(
    (pieceId: number, e: React.PointerEvent<HTMLButtonElement>) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      const board = boardRef.current;
      if (!board) return;

      const boardRect = board.getBoundingClientRect();
      const cellWidth = boardRect.width / gridSize;
      const cellHeight = boardRect.height / gridSize;

      const piece = pieces.find((p) => p.id === pieceId);
      if (!piece) return;

      const groupId = piece.groupId;
      const bbox = getGroupBoundingBox(groupId);
      if (!bbox) return;

      const groupLeft = bbox.minCol * cellWidth;
      const groupTop = bbox.minRow * cellHeight;
      const pointerBoardX = e.clientX - boardRect.left;
      const pointerBoardY = e.clientY - boardRect.top;

      internal.current = {
        active: true,
        movedEnough: false,
        dragStarted: false,
        pointerId: e.pointerId,
        pieceId,
        groupId,
        startClientX: e.clientX,
        startClientY: e.clientY,
        boardRect,
        cellWidth,
        cellHeight,
        bbox,
        pointerOffsetX: pointerBoardX - groupLeft,
        pointerOffsetY: pointerBoardY - groupTop,
        lastGhostX: groupLeft,
        lastGhostY: groupTop,
      };

      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [gridSize, pieces, getGroupBoundingBox]
  );

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const state = internal.current;
      if (!state.active || state.pointerId !== e.pointerId || !state.boardRect || !state.bbox) return;

      const dx = e.clientX - state.startClientX;
      const dy = e.clientY - state.startClientY;

      if (!state.movedEnough) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
        state.movedEnough = true;
      }

      if (!state.dragStarted) {
        state.dragStarted = true;
        onDragStart?.();

        const bboxCols = state.bbox.maxCol - state.bbox.minCol + 1;
        const bboxRows = state.bbox.maxRow - state.bbox.minRow + 1;

        setDragState({
          isDragging: true,
          draggingPieceId: state.pieceId,
          draggingGroupId: state.groupId,
          groupBoundingBox: state.bbox,
          ghostBoardX: state.lastGhostX,
          ghostBoardY: state.lastGhostY,
          ghostWidth: bboxCols * state.cellWidth,
          ghostHeight: bboxRows * state.cellHeight,
        });
      }

      const pointerBoardX = e.clientX - state.boardRect.left;
      const pointerBoardY = e.clientY - state.boardRect.top;
      const ghostX = pointerBoardX - state.pointerOffsetX;
      const ghostY = pointerBoardY - state.pointerOffsetY;

      state.lastGhostX = ghostX;
      state.lastGhostY = ghostY;

      const ghost = ghostRef.current;
      if (ghost) {
        ghost.style.left = `${ghostX}px`;
        ghost.style.top = `${ghostY}px`;
      }

      const anchorCol = Math.floor(ghostX / state.cellWidth);
      const anchorRow = Math.floor(ghostY / state.cellHeight);
      updateDropTarget(anchorRow, anchorCol);
    };

    const handlePointerUp = (e: PointerEvent) => {
      const state = internal.current;
      if (!state.active || state.pointerId !== e.pointerId || !state.bbox) return;

      if (!state.movedEnough) {
        onTap(state.pieceId);
      } else {
        const bboxCols = state.bbox.maxCol - state.bbox.minCol + 1;
        const bboxRows = state.bbox.maxRow - state.bbox.minRow + 1;
        const maxCol = Math.max(0, gridSize - bboxCols);
        const maxRow = Math.max(0, gridSize - bboxRows);

        const targetCol = Math.max(0, Math.min(maxCol, Math.floor(state.lastGhostX / state.cellWidth)));
        const targetRow = Math.max(0, Math.min(maxRow, Math.floor(state.lastGhostY / state.cellHeight)));
        onDropGroup(state.groupId, targetRow * gridSize + targetCol);
      }

      internal.current.active = false;
      resetVisuals();
    };

    const handlePointerCancel = (e: PointerEvent) => {
      const state = internal.current;
      if (!state.active || state.pointerId !== e.pointerId) return;
      internal.current.active = false;
      resetVisuals();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, [gridSize, onDragStart, onDropGroup, onTap, resetVisuals, updateDropTarget]);

  const isDraggingPiece = useCallback(
    (pieceId: number) => {
      if (!dragState.isDragging || dragState.draggingGroupId === null) return false;
      const piece = pieces.find((p) => p.id === pieceId);
      return piece?.groupId === dragState.draggingGroupId;
    },
    [dragState.isDragging, dragState.draggingGroupId, pieces]
  );

  return { dragState, boardRef, ghostRef, dropTargetRef, onPiecePointerDown, isDraggingPiece };
}
