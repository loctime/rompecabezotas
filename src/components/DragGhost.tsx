import { memo } from 'react';
import type { DragState } from '../hooks/useDrag';
import type { PuzzlePiece } from '../types';
import styles from './DragGhost.module.css';

interface Props {
  dragState: DragState;
  pieces: PuzzlePiece[];
  imageUrl: string;
  gridSize: number;
}

export const DragGhost = memo(function DragGhost({ dragState, pieces, imageUrl, gridSize }: Props) {
  if (!dragState.isDragging || dragState.draggingPieceId === null) return null;

  const piece = pieces.find((p) => p.id === dragState.draggingPieceId);
  if (!piece) return null;

  const bgPosX = gridSize > 1 ? (piece.col / (gridSize - 1)) * 100 : 0;
  const bgPosY = gridSize > 1 ? (piece.row / (gridSize - 1)) * 100 : 0;

  return (
    <div
      className={styles.ghost}
      aria-hidden
      style={{
        left: dragState.ghostX,
        top: dragState.ghostY,
        width: dragState.ghostSize,
        height: dragState.ghostSize,
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
        backgroundPosition: `${bgPosX}% ${bgPosY}%`,
      }}
    />
  );
});
