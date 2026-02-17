import { memo, useMemo, useState, useEffect, useRef, useCallback } from 'react';
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
  onDragStart: () => void;
}

interface GroupBorderProps {
  group: PieceGroup;
  pieceById: Map<number, PuzzlePieceType>;
  gridSize: number;
}

type Edge = { x1: number; y1: number; x2: number; y2: number };

const GroupBorder = memo(function GroupBorder({ group, pieceById, gridSize }: GroupBorderProps) {
  const edges = useMemo(() => {
    const pieceSize = 100 / gridSize;

    const groupPieces = group.pieceIds
      .map((id) => pieceById.get(id))
      .filter((piece): piece is PuzzlePieceType => Boolean(piece))
      .filter((p) => p.currentPosition === p.correctPosition);

    if (groupPieces.length < 2) return [] as Edge[];

    const posSet = new Set(groupPieces.map((p) => p.currentPosition));
    const boardEdges: Edge[] = [];

    for (const piece of groupPieces) {
      const row = Math.floor(piece.currentPosition / gridSize);
      const col = piece.currentPosition % gridSize;
      const x = col * pieceSize;
      const y = row * pieceSize;
      const s = pieceSize;

      if (row === 0 || !posSet.has(piece.currentPosition - gridSize)) {
        boardEdges.push({ x1: x, y1: y, x2: x + s, y2: y });
      }
      if (row === gridSize - 1 || !posSet.has(piece.currentPosition + gridSize)) {
        boardEdges.push({ x1: x, y1: y + s, x2: x + s, y2: y + s });
      }
      if (col === 0 || !posSet.has(piece.currentPosition - 1)) {
        boardEdges.push({ x1: x, y1: y, x2: x, y2: y + s });
      }
      if (col === gridSize - 1 || !posSet.has(piece.currentPosition + 1)) {
        boardEdges.push({ x1: x + s, y1: y, x2: x + s, y2: y + s });
      }
    }

    return boardEdges;
  }, [group.pieceIds, gridSize, pieceById]);

  if (edges.length === 0) return null;

  return (
    <svg className={styles.groupBorderSvg} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      {edges.map((e, i) => (
        <line key={`${group.id}-${i}`} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} strokeWidth="0.8" strokeLinecap="round" />
      ))}
    </svg>
  );
});

/** Overlay de drop target actualizado imperativamente por useDrag (evita rerenders) */
const DropTargetOverlay = memo(function DropTargetOverlay({
  dropTargetRef,
  isDragging,
}: {
  dropTargetRef: React.RefObject<HTMLDivElement | null>;
  isDragging: boolean;
}) {
  if (!isDragging) return null;
  return <div ref={dropTargetRef} className={styles.dropTargetOverlay} aria-hidden style={{ display: 'none' }} />;
});

export function GameBoard({
  pieces,
  groups,
  selectedPieceId,
  hintPieceId,
  imageUrl,
  gridSize,
  onPieceClick,
  onSwap,
  onDragStart,
}: Props) {
  const [mergingPieceIds, setMergingPieceIds] = useState<Set<number>>(new Set());
  const prevGroupCountRef = useRef(groups.length);

  useEffect(() => {
    const prev = prevGroupCountRef.current;
    if (groups.length < prev) {
      const correctPieceIds = new Set(
        pieces.filter((p) => p.currentPosition === p.correctPosition).map((p) => p.id)
      );
      setMergingPieceIds(correctPieceIds);
      prevGroupCountRef.current = groups.length;
      const timer = setTimeout(() => setMergingPieceIds(new Set()), 500);
      return () => clearTimeout(timer);
    }
    prevGroupCountRef.current = groups.length;
  }, [groups.length, pieces]);

  const groupSizeMap = useMemo(() => {
    const map = new Map<number, number>();
    for (const g of groups) {
      for (const id of g.pieceIds) map.set(id, g.pieceIds.length);
    }
    return map;
  }, [groups]);

  const pieceById = useMemo(() => new Map(pieces.map((piece) => [piece.id, piece])), [pieces]);
  const pieceByPosition = useMemo(() => new Map(pieces.map((piece) => [piece.currentPosition, piece])), [pieces]);
  const mergedGroups = useMemo(() => groups.filter((g) => g.pieceIds.length > 1), [groups]);

  // Helper to check if a piece shares groupId with neighbor
  const hasSameGroupNeighbor = useCallback(
    (piece: PuzzlePieceType, direction: 'top' | 'right' | 'bottom' | 'left'): boolean => {
      const row = Math.floor(piece.currentPosition / gridSize);
      const col = piece.currentPosition % gridSize;
      let neighborPos: number | null = null;

      switch (direction) {
        case 'top':
          neighborPos = row > 0 ? piece.currentPosition - gridSize : null;
          break;
        case 'right':
          neighborPos = col < gridSize - 1 ? piece.currentPosition + 1 : null;
          break;
        case 'bottom':
          neighborPos = row < gridSize - 1 ? piece.currentPosition + gridSize : null;
          break;
        case 'left':
          neighborPos = col > 0 ? piece.currentPosition - 1 : null;
          break;
      }

      if (neighborPos === null) return false;
      const neighbor = pieceByPosition.get(neighborPos);
      return neighbor?.groupId === piece.groupId;
    },
    [gridSize, pieceByPosition]
  );

  const { dragState, boardRef, ghostRef, dropTargetRef, onPiecePointerDown, isDraggingPiece } = useDrag(
    pieces,
    groups,
    gridSize,
    onPieceClick,
    onSwap,
    onDragStart
  );

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
      >
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
            hideTopBorder={hasSameGroupNeighbor(piece, 'top')}
            hideRightBorder={hasSameGroupNeighbor(piece, 'right')}
            hideBottomBorder={hasSameGroupNeighbor(piece, 'bottom')}
            hideLeftBorder={hasSameGroupNeighbor(piece, 'left')}
            onPointerDown={(e) => onPiecePointerDown(piece.id, e)}
            onClick={() => {}}
          />
        ))}

        {mergedGroups.map((group) => (
          <GroupBorder key={group.id} group={group} pieceById={pieceById} gridSize={gridSize} />
        ))}
      </motion.div>

      <DropTargetOverlay dropTargetRef={dropTargetRef} isDragging={dragState.isDragging} />
      <DragGhost dragState={dragState} ghostRef={ghostRef} pieces={pieces} groups={groups} imageUrl={imageUrl} gridSize={gridSize} />
    </>
  );
}
