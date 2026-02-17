import { useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { PuzzlePiece as PuzzlePieceType, PieceGroup } from '../types';
import { PuzzlePiece } from './PuzzlePiece';
import styles from './GameBoard.module.css';

interface Props {
  pieces: PuzzlePieceType[];
  groups: PieceGroup[];
  selectedPieceId: number | null;
  hintPieceId: number | null;
  imageUrl: string;
  gridSize: number;
  onPieceClick: (id: number) => void;
}

// ── Group border overlay ───────────────────────────────────────────────────────
// Renders a visual outline around merged groups (pieces in correct position)

interface GroupBorderProps {
  group: PieceGroup;
  pieces: PuzzlePieceType[];
  gridSize: number;
}

function GroupBorder({ group, pieces, gridSize }: GroupBorderProps) {
  const pieceSize = 100 / gridSize; // percent per cell

  // Find all correct pieces in this group
  const groupPieces = pieces.filter(
    (p) => group.pieceIds.includes(p.id) && p.currentPosition === p.correctPosition
  );

  if (groupPieces.length < 2) return null;

  // Build a set of occupied cells for edge detection
  const posSet = new Set(groupPieces.map((p) => p.currentPosition));

  // For each piece, determine which of its 4 edges are on the group boundary
  // (i.e. the neighbor in that direction is NOT in the group)
  type Edge = { x1: number; y1: number; x2: number; y2: number };
  const edges: Edge[] = [];

  for (const piece of groupPieces) {
    const row = Math.floor(piece.currentPosition / gridSize);
    const col = piece.currentPosition % gridSize;
    const x = col * pieceSize;
    const y = row * pieceSize;
    const s = pieceSize;

    // top edge
    const topPos = piece.currentPosition - gridSize;
    if (row === 0 || !posSet.has(topPos)) {
      edges.push({ x1: x, y1: y, x2: x + s, y2: y });
    }
    // bottom edge
    const bottomPos = piece.currentPosition + gridSize;
    if (row === gridSize - 1 || !posSet.has(bottomPos)) {
      edges.push({ x1: x, y1: y + s, x2: x + s, y2: y + s });
    }
    // left edge
    const leftPos = piece.currentPosition - 1;
    if (col === 0 || !posSet.has(leftPos)) {
      edges.push({ x1: x, y1: y, x2: x, y2: y + s });
    }
    // right edge
    const rightPos = piece.currentPosition + 1;
    if (col === gridSize - 1 || !posSet.has(rightPos)) {
      edges.push({ x1: x + s, y1: y, x2: x + s, y2: y + s });
    }
  }

  return (
    <svg
      className={styles.groupBorderSvg}
      viewBox={`0 0 100 100`}
      preserveAspectRatio="none"
      aria-hidden
    >
      {edges.map((e, i) => (
        <line
          key={i}
          x1={e.x1}
          y1={e.y1}
          x2={e.x2}
          y2={e.y2}
          strokeWidth="0.8"
          strokeLinecap="round"
        />
      ))}
    </svg>
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
}: Props) {
  const [mergingPieceIds, setMergingPieceIds] = useState<Set<number>>(new Set());
  const prevGroupCountRef = useRef(groups.length);

  // Trigger flash animation on merge
  useEffect(() => {
    const prev = prevGroupCountRef.current;
    if (groups.length < prev) {
      const correctPieceIds = new Set(
        pieces
          .filter((p) => p.currentPosition === p.correctPosition)
          .map((p) => p.id)
      );
      setMergingPieceIds(correctPieceIds);
      prevGroupCountRef.current = groups.length;
      const timer = setTimeout(() => setMergingPieceIds(new Set()), 500);
      return () => clearTimeout(timer);
    }
    prevGroupCountRef.current = groups.length;
  }, [groups.length, pieces]);

  // Precompute group sizes for quick lookup
  const groupSizeMap = useMemo(() => {
    const map = new Map<number, number>();
    for (const g of groups) {
      for (const id of g.pieceIds) map.set(id, g.pieceIds.length);
    }
    return map;
  }, [groups]);

  // Only render borders for groups with 2+ correct pieces
  const mergedGroups = useMemo(
    () => groups.filter((g) => g.pieceIds.length > 1),
    [groups]
  );

  return (
    <motion.div
      className={styles.board}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
      role="grid"
      aria-label={`Tablero de puzzle ${gridSize}x${gridSize}`}
    >
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
          onClick={() => onPieceClick(piece.id)}
        />
      ))}

      {/* Group border overlays — one SVG per merged group */}
      {mergedGroups.map((group) => (
        <GroupBorder
          key={group.id}
          group={group}
          pieces={pieces}
          gridSize={gridSize}
        />
      ))}
    </motion.div>
  );
}
