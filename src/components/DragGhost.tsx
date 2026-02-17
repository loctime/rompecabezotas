import { memo, useMemo } from 'react';
import type { DragState } from '../hooks/useDrag';
import type { PuzzlePiece, PieceGroup } from '../types';
import styles from './DragGhost.module.css';

const FALLBACK_IMAGE = '/images/levels/fallback.png';

interface Props {
  dragState: DragState;
  ghostRef: React.RefObject<HTMLDivElement | null>;
  pieces: PuzzlePiece[];
  groups: PieceGroup[];
  imageUrl: string;
  gridSize: number;
}

export const DragGhost = memo(function DragGhost({ dragState, ghostRef, pieces, groups, imageUrl, gridSize }: Props) {
  if (!dragState.isDragging || dragState.draggingPieceId === null || dragState.draggingGroupId === null) return null;

  const piece = pieces.find((p) => p.id === dragState.draggingPieceId);
  if (!piece) return null;

  const group = groups.find((g) => g.id === dragState.draggingGroupId);
  if (!group) return null;

  // Calculate bounding box of the group
  const groupPieces = group.pieceIds
    .map((id) => pieces.find((p) => p.id === id))
    .filter((p): p is PuzzlePiece => Boolean(p));

  if (groupPieces.length === 0) return null;

  const positions = groupPieces.map((p) => p.currentPosition);
  const rows = positions.map((pos) => Math.floor(pos / gridSize));
  const cols = positions.map((pos) => pos % gridSize);

  const minRow = Math.min(...rows);
  const maxRow = Math.max(...rows);
  const minCol = Math.min(...cols);
  const maxCol = Math.max(...cols);

  // Find the top-left piece of the group (by current position)
  const topLeftPiece = groupPieces.find((p) => {
    const row = Math.floor(p.currentPosition / gridSize);
    const col = p.currentPosition % gridSize;
    return row === minRow && col === minCol;
  }) || groupPieces[0];

  // Use correct coordinates (row/col) for background position, not currentPosition
  // This ensures the image shows the correct portion regardless of where the group is on the board
  const bgPosX = gridSize > 1 ? (topLeftPiece.col / (gridSize - 1)) * 100 : 0;
  const bgPosY = gridSize > 1 ? (topLeftPiece.row / (gridSize - 1)) * 100 : 0;

  // Calculate size of the group (ghostSize is the size of a single piece)
  const groupWidth = maxCol - minCol + 1;
  const groupHeight = maxRow - minRow + 1;
  const groupSizeX = dragState.ghostSize * groupWidth;
  const groupSizeY = dragState.ghostSize * groupHeight;

  return (
    <div
      ref={ghostRef}
      className={styles.ghost}
      aria-hidden
      style={{
        left: dragState.ghostStartX,
        top: dragState.ghostStartY,
        width: groupSizeX,
        height: groupSizeY,
        transform: 'translate3d(0, 0, 0)',
        backgroundImage: `url("${imageUrl}")`,
        backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
        backgroundPosition: `${bgPosX}% ${bgPosY}%`,
      }}
    />
  );
});
