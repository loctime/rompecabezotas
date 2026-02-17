import { useCallback, useEffect, useRef, useState } from 'react';
import type { PieceGroup } from '../types';

/** Estado mínimo para montar/desmontar el overlay. NO incluye ghostX/Y ni hoverPosition. */
export interface DragState {
  isDragging: boolean;
  draggingPieceId: number | null;
  draggingGroupId: number | null;
  ghostSize: number;
  ghostStartX: number;
  ghostStartY: number;
  anchorOffsetX: number;
  anchorOffsetY: number;
  groupBoundingBox: { minRow: number; maxRow: number; minCol: number; maxCol: number } | null;
  cellWidthPx: number;
  cellHeightPx: number;
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
  onSwap: (pieceId1: number, pieceId2: number) => void,
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
    ghostSize: 0,
    ghostStartX: 0,
    ghostStartY: 0,
    anchorOffsetX: 0,
    anchorOffsetY: 0,
    groupBoundingBox: null,
    cellWidthPx: 0,
    cellHeightPx: 0,
  });

  const internal = useRef({
    active: false,
    pieceId: -1,
    groupId: -1,
    startX: 0,
    startY: 0,
    movedEnough: false,
    pointerId: -1,
    dragStartNotified: false,
    boardRect: null as DOMRect | null,
    anchorOffsetX: 0,
    anchorOffsetY: 0,
    groupBoundingBox: null as { minRow: number; maxRow: number; minCol: number; maxCol: number } | null,
    ghostStartX: 0,
    ghostStartY: 0,
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

      // Use cell dimensions for exact grid calculation
      const cellWidthPx = rect.width / gridSize;
      const cellHeightPx = rect.height / gridSize;
      
      const col = Math.floor(relX / cellWidthPx);
      const row = Math.floor(relY / cellHeightPx);

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
      if (!targetPiece) {
        el.style.display = 'none';
        return;
      }

      // Don't show drop target if target is part of the same group
      if (targetPiece.groupId === internal.current.groupId) {
        el.style.display = 'none';
        return;
      }

      // Use cell dimensions for exact positioning (geometrically correct)
      const cellWidthPx = rect.width / gridSize;
      const cellHeightPx = rect.height / gridSize;
      const row = Math.floor(position / gridSize);
      const col = position % gridSize;
      
      // For groups, show the full bounding box size
      const state = internal.current;
      if (state.groupBoundingBox) {
        const bboxCols = state.groupBoundingBox.maxCol - state.groupBoundingBox.minCol + 1;
        const bboxRows = state.groupBoundingBox.maxRow - state.groupBoundingBox.minRow + 1;
        
        el.style.display = 'block';
        el.style.left = `${rect.left + col * cellWidthPx}px`;
        el.style.top = `${rect.top + row * cellHeightPx}px`;
        el.style.width = `${bboxCols * cellWidthPx}px`;
        el.style.height = `${bboxRows * cellHeightPx}px`;
      } else {
        el.style.display = 'block';
        el.style.left = `${rect.left + col * cellWidthPx}px`;
        el.style.top = `${rect.top + row * cellHeightPx}px`;
        el.style.width = `${cellWidthPx}px`;
        el.style.height = `${cellHeightPx}px`;
      }
    },
    [gridSize, pieces]
  );

  const resetDragVisual = useCallback(() => {
    setDragState((prev) =>
      prev.isDragging || prev.draggingPieceId !== null
        ? {
            isDragging: false,
            draggingPieceId: null,
            draggingGroupId: null,
            ghostSize: 0,
            ghostStartX: 0,
            ghostStartY: 0,
            anchorOffsetX: 0,
            anchorOffsetY: 0,
            groupBoundingBox: null,
            cellWidthPx: 0,
            cellHeightPx: 0,
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

    const piece = pieces.find((p) => p.id === pieceId);
    const board = boardRef.current;
    const boardRect = board ? board.getBoundingClientRect() : null;
    
    if (!boardRect) return;

    const groupId = piece?.groupId ?? -1;
    const group = groups.find((g) => g.id === groupId);
    
    let anchorOffsetX = 0;
    let anchorOffsetY = 0;
    let groupBoundingBox: { minRow: number; maxRow: number; minCol: number; maxCol: number } | null = null;

    if (group && group.pieceIds.length > 1) {
      // Calculate bounding box of the group
      const groupPieces = group.pieceIds
        .map((id) => pieces.find((p) => p.id === id))
        .filter((p): p is PieceLike => Boolean(p));
      
      if (groupPieces.length > 0) {
        const positions = groupPieces.map((p) => p.currentPosition);
        const rows = positions.map((pos) => Math.floor(pos / gridSize));
        const cols = positions.map((pos) => pos % gridSize);
        
        const minRow = Math.min(...rows);
        const maxRow = Math.max(...rows);
        const minCol = Math.min(...cols);
        const maxCol = Math.max(...cols);
        
        groupBoundingBox = { minRow, maxRow, minCol, maxCol };
        
        // Calculate offset of pointer relative to top-left corner of group bounding box
        // Use cell dimensions for exact positioning (geometrically correct)
        const cellWidthPx = boardRect.width / gridSize;
        const cellHeightPx = boardRect.height / gridSize;
        const groupTopLeftX = boardRect.left + minCol * cellWidthPx;
        const groupTopLeftY = boardRect.top + minRow * cellHeightPx;
        
        anchorOffsetX = e.clientX - groupTopLeftX;
        anchorOffsetY = e.clientY - groupTopLeftY;
      }
    } else {
      // Single piece: offset is relative to piece center
      // Use cell dimensions for exact positioning (geometrically correct)
      const cellWidthPx = boardRect.width / gridSize;
      const cellHeightPx = boardRect.height / gridSize;
      const pieceRow = Math.floor(piece!.currentPosition / gridSize);
      const pieceCol = piece!.currentPosition % gridSize;
      const pieceCenterX = boardRect.left + pieceCol * cellWidthPx + cellWidthPx / 2;
      const pieceCenterY = boardRect.top + pieceRow * cellHeightPx + cellHeightPx / 2;
      
      anchorOffsetX = e.clientX - pieceCenterX;
      anchorOffsetY = e.clientY - pieceCenterY;
    }

    internal.current = {
      active: true,
      pieceId,
      groupId,
      startX: e.clientX,
      startY: e.clientY,
      movedEnough: false,
      pointerId: e.pointerId,
      dragStartNotified: false,
      boardRect,
      anchorOffsetX,
      anchorOffsetY,
      groupBoundingBox,
      ghostStartX: 0,
      ghostStartY: 0,
    };
  }, [pieces, groups, gridSize]);

  const startDragRef = useRef<() => void>(() => {});
  startDragRef.current = () => {
    const state = internal.current;
    if (!state.active || state.pieceId < 0 || !state.boardRect) return;

    // Calculate cell dimensions using cached boardRect (geometrically correct)
    const cellWidthPx = state.boardRect.width / gridSize;
    const cellHeightPx = state.boardRect.height / gridSize;
    const pieceSize = cellWidthPx; // For backward compatibility, use width
    
    const group = groups.find((g) => g.id === state.groupId);
    
    if (group && state.groupBoundingBox) {
      // Group: calculate initial position using anchor offset
      // Initial ghost position = pointer position - anchor offset
      const startX = state.startX - state.anchorOffsetX;
      const startY = state.startY - state.anchorOffsetY;
      
      internal.current.ghostStartX = startX;
      internal.current.ghostStartY = startY;
      
      setDragState({
        isDragging: true,
        draggingPieceId: state.pieceId,
        draggingGroupId: state.groupId,
        ghostSize: pieceSize,
        ghostStartX: startX,
        ghostStartY: startY,
        anchorOffsetX: state.anchorOffsetX,
        anchorOffsetY: state.anchorOffsetY,
        groupBoundingBox: state.groupBoundingBox,
        cellWidthPx,
        cellHeightPx,
      });
    } else {
      // Single piece: use anchor offset
      const piece = pieces.find((p) => p.id === state.pieceId);
      if (!piece) return;
      
      const startX = state.startX - state.anchorOffsetX;
      const startY = state.startY - state.anchorOffsetY;

      internal.current.ghostStartX = startX;
      internal.current.ghostStartY = startY;

      setDragState({
        isDragging: true,
        draggingPieceId: state.pieceId,
        draggingGroupId: state.groupId,
        ghostSize: pieceSize,
        ghostStartX: startX,
        ghostStartY: startY,
        anchorOffsetX: state.anchorOffsetX,
        anchorOffsetY: state.anchorOffsetY,
        groupBoundingBox: null,
        cellWidthPx,
        cellHeightPx,
      });
    }
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

      // ─── MOVIMIENTO VISUAL: solo ghost, DOM imperativo, cero setState ───
      const ghost = ghostRef.current;
      if (ghost && state.boardRect && dragState.isDragging) {
        // Calculate group position: pointer position - anchor offset
        const groupX = e.clientX - state.anchorOffsetX;
        const groupY = e.clientY - state.anchorOffsetY;
        
        // Update ghost position directly using ONLY left/top (no transform)
        ghost.style.left = `${groupX}px`;
        ghost.style.top = `${groupY}px`;
      }

      // Hit-test para drop target: usar top-left del ghost para preview
      let targetPos: number | null = null;
      if (state.groupBoundingBox && state.boardRect && ghostRef.current) {
        // Use ghost's top-left corner (geometrically correct)
        const ghostRect = ghostRef.current.getBoundingClientRect();
        targetPos = getPositionFromPoint(ghostRect.left, ghostRect.top);
      } else {
        targetPos = getPositionFromPoint(e.clientX, e.clientY);
      }
      updateDropTarget(targetPos);
    };

    const handlePointerUp = (e: PointerEvent) => {
      const state = internal.current;
      if (!state.active || e.pointerId !== state.pointerId) return;

      if (!state.movedEnough) {
        onTap(state.pieceId);
      } else {
        // Free movement: drop group based on ghost's top-left corner (geometrically correct)
        if (state.groupId !== -1 && state.boardRect && dragState.isDragging) {
          let targetPos: number | null = null;
          
          if (state.groupBoundingBox && ghostRef.current && state.boardRect) {
            // Get ghost's top-left corner (geometrically correct)
            const ghostRect = ghostRef.current.getBoundingClientRect();
            
            // Use cell dimensions for exact snap
            const cellWidthPx = state.boardRect.width / gridSize;
            const cellHeightPx = state.boardRect.height / gridSize;
            
            // Convert ghost top-left to grid coordinates
            const relX = ghostRect.left - state.boardRect.left;
            const relY = ghostRect.top - state.boardRect.top;
            
            const targetCol = Math.floor(relX / cellWidthPx);
            const targetRow = Math.floor(relY / cellHeightPx);
            
            // Clamp accounting for group size
            const bboxCols = state.groupBoundingBox.maxCol - state.groupBoundingBox.minCol + 1;
            const bboxRows = state.groupBoundingBox.maxRow - state.groupBoundingBox.minRow + 1;
            const maxCol = Math.max(0, gridSize - bboxCols);
            const maxRow = Math.max(0, gridSize - bboxRows);
            
            const clampedCol = Math.max(0, Math.min(maxCol, targetCol));
            const clampedRow = Math.max(0, Math.min(maxRow, targetRow));
            
            targetPos = clampedRow * gridSize + clampedCol;
          } else {
            targetPos = getPositionFromPoint(e.clientX, e.clientY);
          }
          
          if (targetPos !== null) {
            onDropGroup(state.groupId, targetPos);
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
  }, [pieces, groups, getPositionFromPoint, getPieceSizePx, onTap, onSwap, onDropGroup, onDragStart, resetDragVisual, updateDropTarget, dragState.isDragging]);

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