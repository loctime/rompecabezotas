import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { PuzzlePiece as PuzzlePieceType, PieceGroup } from '../types';
import { PuzzlePiece } from './PuzzlePiece';
import styles from './GameBoard.module.css';

interface Props {
  pieces: PuzzlePieceType[];
  groups: PieceGroup[];
  selectedPieceId: number | null;
  imageUrl: string;
  gridSize: number;
  onPieceClick: (id: number) => void;
}

export function GameBoard({
  pieces,
  groups,
  selectedPieceId,
  imageUrl,
  gridSize,
  onPieceClick,
}: Props) {
  const [mergingPieceIds, setMergingPieceIds] = useState<Set<number>>(new Set());
  const prevGroupCountRef = { current: groups.length };

  // Track merge events to trigger flash animation
  useEffect(() => {
    const prev = prevGroupCountRef.current;
    if (groups.length < prev) {
      // A merge happened — find pieces that just merged
      const correctPieceIds = new Set(
        pieces.filter((p) => p.currentPosition === p.correctPosition).map((p) => p.id)
      );
      setMergingPieceIds(correctPieceIds);
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

  return (
    <motion.div
      className={styles.board}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
      role="grid"
      aria-label={`Tablero de puzzle ${gridSize}×${gridSize}`}
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
          onClick={() => onPieceClick(piece.id)}
        />
      ))}
    </motion.div>
  );
}
