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
  isHint: boolean;
  isDragging: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onClick: () => void;
}

export const PuzzlePiece = memo(function PuzzlePiece({
  piece,
  imageUrl,
  gridSize,
  isSelected,
  isInGroup,
  isMerging,
  isHint,
  isDragging,
  onPointerDown,
  onClick,
}: Props) {
  const pieceSize = 100 / gridSize;
  const currentRow = Math.floor(piece.currentPosition / gridSize);
  const currentCol = piece.currentPosition % gridSize;
  const isCorrect = piece.currentPosition === piece.correctPosition;

  const bgPosX = gridSize > 1 ? (piece.col / (gridSize - 1)) * 100 : 0;
  const bgPosY = gridSize > 1 ? (piece.row / (gridSize - 1)) * 100 : 0;

  const innerClass = [
    styles.inner,
    isSelected && styles.selected,
    isCorrect && styles.correct,
    isInGroup && styles.inGroup,
    isMerging && styles.merging,
    isHint && styles.hint,
    isDragging && styles.dragging,
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
        // Hide original while dragging ghost is shown
        opacity: isDragging ? 0.25 : 1,
        zIndex: isDragging ? 0 : isSelected ? 10 : 1,
      }}
      layout
      layoutId={`piece-${piece.id}`}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: isDragging ? 0.9 : 1, opacity: isDragging ? 0.25 : 1 }}
    >
      <button
        className={innerClass}
        onPointerDown={onPointerDown}
        onClick={onClick}
        aria-label={`Pieza ${piece.id + 1}${isCorrect ? ' (en posicion correcta)' : ''}${isHint ? ' (pista)' : ''}`}
        aria-pressed={isSelected}
        aria-grabbed={isDragging}
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
          backgroundPosition: `${bgPosX}% ${bgPosY}%`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      />
    </motion.div>
  );
});
