import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { PuzzlePiece as PuzzlePieceType, PieceGroup } from '../types';
import { PuzzlePiece } from './PuzzlePiece';
import { DragGhost } from './DragGhost';
import { useDrag } from '../hooks/useDrag';
import styles from './GameBoard.module.css';

interface Props {
  pieces: PuzzlePieceType[];
  groups: PieceGroup[];
  selectedPieceId: number | null;
  hintPieceId: number | null;
  imageUrl: string;
  gridSize: number;
  onPieceClick: (id: number) => void;
  onSwap: (pieceId1: number, pieceId2: number) => void;
}

// ── Group border SVG overlay ───────────────────────────────────────────────────

interface GroupBorderProps {
  group: PieceGroup;
  pieces: PuzzlePieceType[];
  gridSize: number;
}

function GroupBorder({ group, pieces, gridSize }: GroupBorderProps) {
  const pieceSize = 100 / gridSize;
  const groupPieces = pieces.filter(
    (p) => group.pieceIds.includes(p.id) && p.currentPosition === p.correctPosition
  );
  if (groupPieces.length < 2) return null;

  const posSet = new Set(groupPieces.map((p) => p.currentPosition));
  type Edge = { x1: number; y1: number; x2: number; y2: number };
  const edges: Edge[] = [];

  for (const piece of groupPieces) {
    const row = Math.floor(piece.currentPosition / gridSize);
    const col = piece.currentPosition % gridSize;
    const x = col * pieceSize;
    const y = row * pieceSize;
    const s = pieceSize;

    if (row === 0 || !posSet.has(piece.currentPosition - gridSize))
      edges.push({ x1: x, y1: y, x2: x + s, y2: y });
    if (row === gridSize - 1 || !posSet.has(piece.currentPosition + gridSize))
      edges.push({ x1: x, y1: y + s, x2: x + s, y2: y + s });
    if (col === 0 || !posSet.has(piece.currentPosition - 1))
      edges.push({ x1: x, y1: y, x2: x, y2: y + s });
    if (col === gridSize - 1 || !posSet.has(piece.currentPosition + 1))
      edges.push({ x1: x + s, y1: y, x2: x + s, y2: y + s });
  }

  return (
    <svg
      className={styles.groupBorderSvg}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      {edges.map((e, i) => (
        <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} strokeWidth="0.8" strokeLinecap="round" />
      ))}
    </svg>
  );
}

// ── Drop target highlight ─────────────────────────────────────────────────────
// Shows which cell the ghost is hovering over

interface DropTargetProps {
  position: number;
  gridSize: number;
  isActive: boolean;
}

function DropTarget({ position, gridSize, isActive }: DropTargetProps) {
  if (!isActive) return null;
  const pieceSize = 100 / gridSize;
  const row = Math.floor(position / gridSize);
  const col = position % gridSize;

  return (
    <div
      className={styles.dropTarget}
      aria-hidden
      style={{
        width: `${pieceSize}%`,
        height: `${pieceSize}%`,
        left: `${col * pieceSize}%`,
        top: `${row * pieceSize}%`,
      }}
    />
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function GameBoard({
  pieces,
  groups,
  selectedPieceId,
  hintPieceId,
  imageUrl,
  gridSize,
  onPieceClick,
  onSwap,
}: Props) {
  const [mergingPieceIds, setMergingPieceIds] = useState<Set<number>>(new Set());
  const prevGroupCountRef = useRef(groups.length);

  // Trigger flash on merge
  useEffect(() => {
    if (groups.length < prevGroupCountRef.current) {
      const correctIds = new Set(
        pieces.filter((p) => p.currentPosition === p.correctPosition).map((p) => p.id)
      );
      setMergingPieceIds(correctIds);
      prevGroupCountRef.current = groups.length;
      const t = setTimeout(() => setMergingPieceIds(new Set()), 500);
      return () => clearTimeout(t);
    }
    prevGroupCountRef.current = groups.length;
  }, [groups.length, pieces]);

  // Group size map for isInGroup
  const groupSizeMap = useMemo(() => {
    const map = new Map<number, number>();
    for (const g of groups) {
      for (const id of g.pieceIds) map.set(id, g.pieceIds.length);
    }
    return map;
  }, [groups]);

  const mergedGroups = useMemo(() => groups.filter((g) => g.pieceIds.length > 1), [groups]);

  // ── Drag integration ────────────────────────────────────────────────────────

  const { dragState, boardRef, onPiecePointerDown, isDraggingPiece } = useDrag(
    pieces,
    gridSize,
    onPieceClick,
    onSwap,
  );

  // Track which cell the ghost is hovering over (for drop target highlight)
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);

  useEffect(() => {
    if (!dragState.isDragging) {
      setHoverPosition(null);
      return;
    }

    const board = boardRef.current;
    if (!board) return;

    const rect = board.getBoundingClientRect();
    const ghostCenterX = dragState.ghostX + dragState.ghostSize / 2;
    const ghostCenterY = dragState.ghostY + dragState.ghostSize / 2;
    const relX = ghostCenterX - rect.left;
    const relY = ghostCenterY - rect.top;

    if (relX < 0 || relY < 0 || relX > rect.width || relY > rect.height) {
      setHoverPosition(null);
      return;
    }

    const col = Math.floor((relX / rect.width) * gridSize);
    const row = Math.floor((relY / rect.height) * gridSize);
    const pos = Math.max(0, Math.min(gridSize - 1, row)) * gridSize + Math.max(0, Math.min(gridSize - 1, col));
    setHoverPosition(pos);
  }, [dragState, gridSize, boardRef]);

  return (
    <>
      <motion.div
        ref={boardRef}
        className={styles.board}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
        role="grid"
        aria-label={`Tablero de puzzle ${gridSize}x${gridSize}`}
        style={{ cursor: dragState.isDragging ? 'grabbing' : 'default' }}
      >
        {/* Drop target highlight */}
        {hoverPosition !== null && dragState.draggingPieceId !== null && (
          <DropTarget
            position={hoverPosition}
            gridSize={gridSize}
            isActive={
              pieces.find((p) => p.currentPosition === hoverPosition)?.id !==
              dragState.draggingPieceId
            }
          />
        )}

        {/* Pieces */}
        {pieces.map((piece) => (
          <PuzzlePiece
            key={piece.id}
            piece={piece}
            imageUrl={imageUrl}
            gridSize={gridSize}
            isSelected={selectedPieceId === piece.id}
            isInGroup={(groupSizeMap.get(piece.id) ?? 1) > 1}
            isMerging={mergingPieceIds.has(piece.id)}
            isHint={hintPieceId === piece.id}
            isDragging={isDraggingPiece(piece.id)}
            onPointerDown={(e) => onPiecePointerDown(piece.id, e)}
            onClick={() => {}} // handled by useDrag (click = short drag)
          />
        ))}

        {/* Group border overlays */}
        {mergedGroups.map((group) => (
          <GroupBorder key={group.id} group={group} pieces={pieces} gridSize={gridSize} />
        ))}
      </motion.div>

      {/* Ghost rendered outside board (avoids overflow:hidden clipping) */}
      <DragGhost
        dragState={dragState}
        pieces={pieces}
        imageUrl={imageUrl}
        gridSize={gridSize}
      />
    </>
  );
}
