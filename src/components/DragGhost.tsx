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
  if (!dragState.isDragging || dragState.draggingPieceId === null || dragState.draggingGroupId === null) return null;

  const piece = pieces.find((p) => p.id === dragState.draggingPieceId);
  if (!piece) return null;

  const group = groups.find((g) => g.id === dragState.draggingGroupId);
  if (!group) return null;

  // Use cached bounding box if available, otherwise calculate
  let minRow: number, maxRow: number, minCol: number, maxCol: number;
  
  if (dragState.groupBoundingBox) {
    ({ minRow, maxRow, minCol, maxCol } = dragState.groupBoundingBox);
  } else {
    // Fallback: calculate bounding box
    const groupPieces = group.pieceIds
      .map((id) => pieces.find((p) => p.id === id))
      .filter((p): p is PuzzlePiece => Boolean(p));

    if (groupPieces.length === 0) return null;

    const positions = groupPieces.map((p) => p.currentPosition);
    const rows = positions.map((pos) => Math.floor(pos / gridSize));
    const cols = positions.map((pos) => pos % gridSize);

    minRow = Math.min(...rows);
    maxRow = Math.max(...rows);
    minCol = Math.min(...cols);
    maxCol = Math.max(...cols);
  }

  // Find the top-left piece of the group (by correct row/col, not current position)
  const groupPieces = group.pieceIds
    .map((id) => pieces.find((p) => p.id === id))
    .filter((p): p is PuzzlePiece => Boolean(p));

  // Find top-left piece using correct coordinates (row/col)
  const minCorrectRow = Math.min(...groupPieces.map((p) => p.row));
  const topRowPieces = groupPieces.filter((p) => p.row === minCorrectRow);
  const minCorrectCol = Math.min(...topRowPieces.map((p) => p.col));
  const topLeftPiece = topRowPieces.find((p) => p.col === minCorrectCol) || groupPieces[0];

  // Use correct coordinates (row/col) for background position
  const bgPosX = gridSize > 1 ? (topLeftPiece.col / (gridSize - 1)) * 100 : 0;
  const bgPosY = gridSize > 1 ? (topLeftPiece.row / (gridSize - 1)) * 100 : 0;

  // Calculate size of the group using cell dimensions (geometrically correct)
  const bboxCols = maxCol - minCol + 1;
  const bboxRows = maxRow - minRow + 1;
  // Use cellWidthPx and cellHeightPx for exact pixel-perfect sizing
  const groupSizeX = dragState.cellWidthPx * bboxCols;
  const groupSizeY = dragState.cellHeightPx * bboxRows;

  return (
    <div
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ghostRef as any}
      className={styles.ghost}
      aria-hidden
      style={{
        left: dragState.ghostStartX,
        top: dragState.ghostStartY,
        width: groupSizeX,
        height: groupSizeY,
        backgroundImage: `url("${imageUrl}")`,
        backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
        backgroundPosition: `${bgPosX}% ${bgPosY}%`,
      }}
    />
  );
});
