import { memo } from 'react';
import type { DragState } from '../hooks/useDrag';
import type { PuzzlePiece, PieceGroup } from '../types';
import styles from './DragGhost.module.css';

interface Props {
  dragState: DragState;
  ghostRef: React.RefObject<HTMLDivElement | null>;
  pieces: PuzzlePiece[];
  groups: PieceGroup[];
  imageUrl: string;
  gridSize: number;
}

export const DragGhost = memo(function DragGhost({ dragState, ghostRef, pieces, groups, imageUrl, gridSize }: Props) {
  if (!dragState.isDragging || dragState.draggingPieceId === null || dragState.draggingGroupId === null || !dragState.groupBoundingBox) {
    return null;
  }

  const group = groups.find((g) => g.id === dragState.draggingGroupId);
  if (!group) return null;

  const groupPieces = group.pieceIds
    .map((id) => pieces.find((p) => p.id === id))
    .filter((p): p is PuzzlePiece => Boolean(p));
  if (groupPieces.length === 0) return null;

  const topLeftPiece = groupPieces.reduce((best, current) => {
    if (current.row < best.row) return current;
    if (current.row === best.row && current.col < best.col) return current;
    return best;
  }, groupPieces[0]);

  const bgPosX = gridSize > 1 ? (topLeftPiece.col / (gridSize - 1)) * 100 : 0;
  const bgPosY = gridSize > 1 ? (topLeftPiece.row / (gridSize - 1)) * 100 : 0;

  return (
    <div
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ghostRef as any}
      className={styles.ghost}
      aria-hidden
      style={{
        left: dragState.ghostBoardX,
        top: dragState.ghostBoardY,
        width: dragState.ghostWidth,
        height: dragState.ghostHeight,
        backgroundImage: `url("${imageUrl}")`,
        backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
        backgroundPosition: `${bgPosX}% ${bgPosY}%`,
      }}
    />
  );
});
