import { memo } from 'react';
import { motion } from 'framer-motion';
import type { PuzzlePiece as PuzzlePieceType } from '../types';
import styles from './PuzzlePiece.module.css';

interface Props {
  piece: PuzzlePieceType;
  imageUrl: string;
  gridSize: number;
  isSelected: boolean;
  isInGroup: boolean;
  isMerging: boolean;
  onClick: () => void;
}

export const PuzzlePiece = memo(function PuzzlePiece({
  piece,
  imageUrl,
  gridSize,
  isSelected,
  isInGroup,
  isMerging,
  onClick,
}: Props) {
  const pieceSize = 100 / gridSize;
  const currentRow = Math.floor(piece.currentPosition / gridSize);
  const currentCol = piece.currentPosition % gridSize;
  const isCorrect = piece.currentPosition === piece.correctPosition;

  // Build class list without inline style logic
  const innerClass = [
    styles.inner,
    isSelected && styles.selected,
    isCorrect && styles.correct,
    isInGroup && styles.inGroup,
    isMerging && styles.merging,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.div
      className={styles.wrapper}
      style={{
        width: `${pieceSize}%`,
        height: `${pieceSize}%`,
        left: `${currentCol * pieceSize}%`,
        top: `${currentRow * pieceSize}%`,
      }}
      layout
      layoutId={`piece-${piece.id}`}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileTap={{ scale: 0.95 }}
    >
      <button
        className={innerClass}
        onClick={onClick}
        aria-label={`Pieza ${piece.id + 1}${isCorrect ? ' (en posición correcta)' : ''}`}
        aria-pressed={isSelected}
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
          backgroundPosition: `${(piece.col / (gridSize - 1)) * 100}% ${(piece.row / (gridSize - 1)) * 100}%`,
        }}
      />
    </motion.div>
  );
});
