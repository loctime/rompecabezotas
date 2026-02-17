import { memo, type CSSProperties } from 'react';
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
  onClick,
}: Props) {
  const pieceSize = 100 / gridSize;
  const currentRow = Math.floor(piece.currentPosition / gridSize);
  const currentCol = piece.currentPosition % gridSize;
  const isCorrect = piece.currentPosition === piece.correctPosition;

  const innerClass = [
    styles.inner,
    isSelected && styles.selected,
    isCorrect && styles.correct,
    isInGroup && styles.inGroup,
    isMerging && styles.merging,
    isHint && styles.hint,
  ]
    .filter(Boolean)
    .join(' ');

  const bgPosX = gridSize > 1 ? (piece.col / (gridSize - 1)) * 100 : 0;
  const bgPosY = gridSize > 1 ? (piece.row / (gridSize - 1)) * 100 : 0;

  const pieceStyle: CSSProperties = {
    width: `${pieceSize}%`,
    height: `${pieceSize}%`,
    left: `${currentCol * pieceSize}%`,
    top: `${currentRow * pieceSize}%`,
  };

  return (
    <motion.div
      className={styles.wrapper}
      style={pieceStyle}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.22 }}
      layout
      layoutId={`piece-${piece.id}`}
    >
      <button
        className={innerClass}
        onClick={onClick}
        aria-label={`Pieza ${piece.id + 1}${isCorrect ? ' (en posicion correcta)' : ''}${isHint ? ' (pista)' : ''}`}
        aria-pressed={isSelected}
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
          backgroundPosition: `${bgPosX}% ${bgPosY}%`,
        }}
      />
    </motion.div>
  );
});
