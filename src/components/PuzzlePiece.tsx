import { memo, useState, useEffect, type CSSProperties } from 'react';
import type { PuzzlePiece as PuzzlePieceType } from '../types';
import styles from './PuzzlePiece.module.css';

const FALLBACK_IMAGE = '/images/levels/fallback.png';

interface Props {
  piece: PuzzlePieceType;
  imageUrl: string;
  gridSize: number;
  isSelected: boolean;
  isInGroup: boolean;
  isMerging: boolean;
  isHint: boolean;
  isDragging: boolean;
  hideTopBorder?: boolean;
  hideRightBorder?: boolean;
  hideBottomBorder?: boolean;
  hideLeftBorder?: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => void;
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
  hideTopBorder = false,
  hideRightBorder = false,
  hideBottomBorder = false,
  hideLeftBorder = false,
  onPointerDown,
  onClick,
}: Props) {
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);

  // Update image URL when prop changes and preload to detect errors
  useEffect(() => {
    setCurrentImageUrl(imageUrl);
    
    // Preload image to detect errors
    const img = new Image();
    img.onload = () => {
      // Image loaded successfully
    };
    img.onerror = () => {
      // Image failed to load, use fallback
      setCurrentImageUrl(FALLBACK_IMAGE);
    };
    img.src = imageUrl;
  }, [imageUrl]);

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
    isDragging && styles.dragging,
    hideTopBorder && styles.hideTopBorder,
    hideRightBorder && styles.hideRightBorder,
    hideBottomBorder && styles.hideBottomBorder,
    hideLeftBorder && styles.hideLeftBorder,
  ]
    .filter(Boolean)
    .join(' ');
  
  // Pieces are static - no hover effects needed
  const wrapperClass = styles.wrapper;

  const bgPosX = gridSize > 1 ? (piece.col / (gridSize - 1)) * 100 : 0;
  const bgPosY = gridSize > 1 ? (piece.row / (gridSize - 1)) * 100 : 0;

  const pieceStyle: CSSProperties = {
    width: `${pieceSize}%`,
    height: `${pieceSize}%`,
    left: `${currentCol * pieceSize}%`,
    top: `${currentRow * pieceSize}%`,
  };

  return (
    <div
      className={wrapperClass}
      style={{
        ...pieceStyle,
        opacity: isDragging ? 0 : 1, // Completely hide during drag - ghost handles visual
        pointerEvents: isDragging ? 'none' : 'auto', // Disable interaction during drag
      }}
    >
      <button
        className={innerClass}
        onPointerDown={onPointerDown}
        onClick={onClick}
        aria-label={`Pieza ${piece.id + 1}${isCorrect ? ' (en posicion correcta)' : ''}${isHint ? ' (pista)' : ''}`}
        aria-pressed={isSelected}
        aria-grabbed={isDragging}
        style={{
          backgroundImage: `url("${currentImageUrl}")`,
          backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
          backgroundPosition: `${bgPosX}% ${bgPosY}%`,
          cursor: isDragging ? 'grabbing' : 'grab',
          pointerEvents: isDragging ? 'none' : 'auto', // Disable button interaction during drag
        }}
      />
    </div>
  );
});
