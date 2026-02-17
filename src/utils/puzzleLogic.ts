import type { PuzzlePiece, PieceGroup } from '../types';

// ─── SHUFFLE ──────────────────────────────────────────────────────────────────

/** Fisher-Yates shuffle — pure, no mutation of original */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── GENERATION ───────────────────────────────────────────────────────────────

/**
 * Generates shuffled pieces for a gridSize×gridSize puzzle.
 * Guarantees the result is NOT already solved (re-shuffles if needed).
 */
export function generatePuzzlePieces(gridSize: number): PuzzlePiece[] {
  const total = gridSize * gridSize;
  const basePositions = Array.from({ length: total }, (_, i) => i);

  let shuffled: number[];
  do {
    shuffled = shuffleArray(basePositions);
  } while (shuffled.every((pos, i) => pos === i)); // avoid solved state on start

  return Array.from({ length: total }, (_, i) => ({
    id: i,
    correctPosition: i,
    currentPosition: shuffled[i],
    groupId: i,
    row: Math.floor(i / gridSize),
    col: i % gridSize,
  }));
}

/** Each piece starts as its own group */
export function generateInitialGroups(pieces: PuzzlePiece[]): PieceGroup[] {
  return pieces.map((p) => ({
    id: p.id,
    pieceIds: [p.id],
    positions: [p.currentPosition],
  }));
}

// ─── POSITION UTILS ───────────────────────────────────────────────────────────

export function posToRow(pos: number, gridSize: number): number {
  return Math.floor(pos / gridSize);
}

export function posToCol(pos: number, gridSize: number): number {
  return pos % gridSize;
}

/** Whether two grid positions are orthogonally adjacent */
export function arePositionsAdjacent(
  pos1: number,
  pos2: number,
  gridSize: number
): boolean {
  const r1 = posToRow(pos1, gridSize), c1 = posToCol(pos1, gridSize);
  const r2 = posToRow(pos2, gridSize), c2 = posToCol(pos2, gridSize);
  return (r1 === r2 && Math.abs(c1 - c2) === 1) ||
         (c1 === c2 && Math.abs(r1 - r2) === 1);
}

/** Whether two pieces should be neighbors in the completed image */
export function areNeighborsInSolution(
  p1: PuzzlePiece,
  p2: PuzzlePiece,
  gridSize: number
): boolean {
  return arePositionsAdjacent(p1.correctPosition, p2.correctPosition, gridSize);
}

/**
 * Checks if two adjacent pieces have the correct relative relationship.
 * This verifies if the current adjacency matches their correct relative positions (row/col).
 * 
 * Example: If B is to the right of A in current positions, check if B should be 
 * to the right of A according to their correct row/col values.
 */
export function hasCorrectRelativeRelationship(
  p1: PuzzlePiece,
  p2: PuzzlePiece,
  gridSize: number
): boolean {
  // Get current positions
  const p1Row = Math.floor(p1.currentPosition / gridSize);
  const p1Col = p1.currentPosition % gridSize;
  const p2Row = Math.floor(p2.currentPosition / gridSize);
  const p2Col = p2.currentPosition % gridSize;

  // Calculate relative position in current board
  const deltaRow = p2Row - p1Row;
  const deltaCol = p2Col - p1Col;

  // Get correct positions (row/col from piece definition)
  const p1CorrectRow = p1.row;
  const p1CorrectCol = p1.col;
  const p2CorrectRow = p2.row;
  const p2CorrectCol = p2.col;

  // Calculate relative position in correct solution
  const correctDeltaRow = p2CorrectRow - p1CorrectRow;
  const correctDeltaCol = p2CorrectCol - p1CorrectCol;

  // They should have the same relative relationship
  return deltaRow === correctDeltaRow && deltaCol === correctDeltaCol;
}

// ─── PIECE QUERIES ────────────────────────────────────────────────────────────

export function isPieceCorrect(piece: PuzzlePiece): boolean {
  return piece.currentPosition === piece.correctPosition;
}

export function isPuzzleComplete(pieces: PuzzlePiece[]): boolean {
  return pieces.every(isPieceCorrect);
}

// ─── LOOKUP HELPERS (O(1) maps) ───────────────────────────────────────────────

function buildPositionMap(pieces: PuzzlePiece[]): Map<number, PuzzlePiece> {
  return new Map(pieces.map((p) => [p.currentPosition, p]));
}

function buildGroupMap(groups: PieceGroup[]): Map<number, PieceGroup> {
  return new Map(groups.map((g) => [g.id, g]));
}

// ─── SWAP ─────────────────────────────────────────────────────────────────────

/**
 * Swaps two pieces (or their entire groups) by exchanging positions.
 * BUG FIX: uses position offsets relative to the "anchor" piece of each group,
 * and validates that all target positions stay within [0, total-1].
 */
export function swapPiecesOrGroups(
  pieces: PuzzlePiece[],
  groups: PieceGroup[],
  pieceId1: number,
  pieceId2: number
): { pieces: PuzzlePiece[]; groups: PieceGroup[] } {
  const posMap = buildPositionMap(pieces);
  const groupMap = buildGroupMap(groups);

  const anchor1 = pieces.find((p) => p.id === pieceId1);
  const anchor2 = pieces.find((p) => p.id === pieceId2);
  if (!anchor1 || !anchor2) return { pieces, groups };

  const group1 = groupMap.get(anchor1.groupId);
  const group2 = groupMap.get(anchor2.groupId);
  if (!group1 || !group2 || group1.id === group2.id) return { pieces, groups };

  const group1PieceIds = new Set(group1.pieceIds);
  const group2PieceIds = new Set(group2.pieceIds);
  const total = pieces.length;

  // Compute new positions for group1 pieces (they move to where group2 anchor is)
  const newPositionsG1 = new Map<number, number>();
  for (const id of group1.pieceIds) {
    const piece = pieces.find((p) => p.id === id)!;
    const offset = piece.currentPosition - anchor1.currentPosition;
    const newPos = anchor2.currentPosition + offset;
    if (newPos < 0 || newPos >= total) return { pieces, groups }; // abort if OOB
    newPositionsG1.set(id, newPos);
  }

  // Compute new positions for group2 pieces
  const newPositionsG2 = new Map<number, number>();
  for (const id of group2.pieceIds) {
    const piece = pieces.find((p) => p.id === id)!;
    const offset = piece.currentPosition - anchor2.currentPosition;
    const newPos = anchor1.currentPosition + offset;
    if (newPos < 0 || newPos >= total) return { pieces, groups }; // abort if OOB
    newPositionsG2.set(id, newPos);
  }

  // Check no position collision with unmoved pieces
  const allNewPositions = new Set([
    ...newPositionsG1.values(),
    ...newPositionsG2.values(),
  ]);
  for (const [pos, piece] of posMap.entries()) {
    if (!group1PieceIds.has(piece.id) && !group2PieceIds.has(piece.id)) {
      if (allNewPositions.has(pos)) return { pieces, groups }; // collision — abort
    }
  }

  // Apply
  const updatedPieces = pieces.map((p) => {
    if (group1PieceIds.has(p.id)) return { ...p, currentPosition: newPositionsG1.get(p.id)! };
    if (group2PieceIds.has(p.id)) return { ...p, currentPosition: newPositionsG2.get(p.id)! };
    return p;
  });

  const updatedGroups = groups.map((g) => {
    const gPieces = updatedPieces.filter((p) => p.groupId === g.id);
    return { ...g, positions: gPieces.map((p) => p.currentPosition) };
  });

  return { pieces: updatedPieces, groups: updatedGroups };
}

// ─── MERGE ────────────────────────────────────────────────────────────────────

function mergeGroups(
  groups: PieceGroup[],
  id1: number,
  id2: number
): PieceGroup[] {
  const g1 = groups.find((g) => g.id === id1);
  const g2 = groups.find((g) => g.id === id2);
  if (!g1 || !g2 || id1 === id2) return groups;

  const merged: PieceGroup = {
    id: Math.min(id1, id2),
    pieceIds: [...g1.pieceIds, ...g2.pieceIds],
    positions: [...g1.positions, ...g2.positions],
  };

  return [...groups.filter((g) => g.id !== id1 && g.id !== id2), merged];
}

function updateGroupIds(
  pieces: PuzzlePiece[],
  groups: PieceGroup[]
): PuzzlePiece[] {
  // Build a map: pieceId → groupId
  const pieceToGroup = new Map<number, number>();
  for (const g of groups) {
    for (const pid of g.pieceIds) pieceToGroup.set(pid, g.id);
  }
  return pieces.map((p) => ({
    ...p,
    groupId: pieceToGroup.get(p.id) ?? p.id,
  }));
}

/**
 * After any swap, checks all pieces and merges groups that are:
 * 1. Currently adjacent in the grid
 * 2. Have the correct relative relationship (matching row/col deltas)
 * 
 * This works regardless of whether pieces are in their final correct positions.
 * Uses O(1) lookup maps to avoid nested find/filter in hot loops.
 */
export function checkAndMergeAdjacentGroups(
  pieces: PuzzlePiece[],
  groups: PieceGroup[],
  gridSize: number
): { pieces: PuzzlePiece[]; groups: PieceGroup[]; mergedCount: number } {
  let currentPieces = [...pieces];
  let currentGroups = [...groups];
  let mergedCount = 0;
  let changed = true;

  while (changed) {
    changed = false;

    const posMap = buildPositionMap(currentPieces);

    for (const piece of currentPieces) {
      // Check all 4 neighbors
      const neighbors = [
        piece.currentPosition - gridSize, // up
        piece.currentPosition + gridSize, // down
        piece.currentPosition - 1,        // left
        piece.currentPosition + 1,        // right
      ];

      for (const nPos of neighbors) {
        if (nPos < 0 || nPos >= currentPieces.length) continue;

        // Validate adjacency (handles edge columns)
        if (!arePositionsAdjacent(piece.currentPosition, nPos, gridSize)) continue;

        const neighbor = posMap.get(nPos);
        if (!neighbor) continue;
        
        // Skip if already in same group
        if (piece.groupId === neighbor.groupId) continue;

        // Check if they have the correct relative relationship
        if (!hasCorrectRelativeRelationship(piece, neighbor, gridSize)) continue;

        currentGroups = mergeGroups(currentGroups, piece.groupId, neighbor.groupId);
        currentPieces = updateGroupIds(currentPieces, currentGroups);
        mergedCount++;
        changed = true;
        break; // restart loop with fresh maps
      }

      if (changed) break;
    }
  }

  return { pieces: currentPieces, groups: currentGroups, mergedCount };
}

// ─── FREE MOVEMENT ──────────────────────────────────────────────────────────────

/**
 * Finds the nearest free position to a given position, searching in a spiral pattern
 */
function findNearestFreePosition(
  targetPos: number,
  occupiedPositions: Set<number>,
  gridSize: number,
  total: number
): number | null {
  if (!occupiedPositions.has(targetPos)) return targetPos;

  // Spiral search: check positions in expanding radius
  const maxRadius = gridSize;
  for (let radius = 1; radius <= maxRadius; radius++) {
    const targetRow = Math.floor(targetPos / gridSize);
    const targetCol = targetPos % gridSize;

    // Check all positions at this radius
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        // Only check positions at exactly this radius (not inside)
        if (Math.abs(dr) !== radius && Math.abs(dc) !== radius) continue;

        const newRow = targetRow + dr;
        const newCol = targetCol + dc;

        if (newRow < 0 || newRow >= gridSize || newCol < 0 || newCol >= gridSize) continue;

        const newPos = newRow * gridSize + newCol;
        if (newPos < 0 || newPos >= total) continue;
        if (!occupiedPositions.has(newPos)) return newPos;
      }
    }
  }

  return null; // No free position found
}

/**
 * Moves a group to a target position with push logic.
 * If target positions are occupied, displaces existing pieces to nearby free positions.
 * Maintains the relative shape of the group.
 */
export function moveGroupToPosition(
  pieces: PuzzlePiece[],
  groups: PieceGroup[],
  groupId: number,
  targetPosition: number,
  gridSize: number
): { pieces: PuzzlePiece[]; groups: PieceGroup[] } {
  const groupMap = buildGroupMap(groups);
  const group = groupMap.get(groupId);
  if (!group) return { pieces, groups };

  const groupPieces = group.pieceIds
    .map((id) => pieces.find((p) => p.id === id))
    .filter((p): p is PuzzlePiece => Boolean(p));

  if (groupPieces.length === 0) return { pieces, groups };

  // Find the anchor piece (top-left of the group)
  const groupPositions = groupPieces.map((p) => p.currentPosition);
  const groupRows = groupPositions.map((pos) => Math.floor(pos / gridSize));
  const groupCols = groupPositions.map((pos) => pos % gridSize);

  const minRow = Math.min(...groupRows);
  const minCol = Math.min(...groupCols);

  const anchorPiece = groupPieces.find((p) => {
    const row = Math.floor(p.currentPosition / gridSize);
    const col = p.currentPosition % gridSize;
    return row === minRow && col === minCol;
  }) || groupPieces[0];

  // Calculate offset needed to move anchor to target position
  const anchorCurrentRow = Math.floor(anchorPiece.currentPosition / gridSize);
  const anchorCurrentCol = anchorPiece.currentPosition % gridSize;
  const targetRow = Math.floor(targetPosition / gridSize);
  const targetCol = targetPosition % gridSize;

  const deltaRow = targetRow - anchorCurrentRow;
  const deltaCol = targetCol - anchorCurrentCol;

  // Calculate new positions for all pieces in the group
  const groupPieceIds = new Set(group.pieceIds);
  const newGroupPositions = new Map<number, number>();

  for (const piece of groupPieces) {
    const currentRow = Math.floor(piece.currentPosition / gridSize);
    const currentCol = piece.currentPosition % gridSize;
    const newRow = currentRow + deltaRow;
    const newCol = currentCol + deltaCol;

    // Validate bounds
    if (newRow < 0 || newRow >= gridSize || newCol < 0 || newCol >= gridSize) {
      return { pieces, groups }; // Out of bounds, abort
    }

    const newPos = newRow * gridSize + newCol;
    newGroupPositions.set(piece.id, newPos);
  }

  // Build map of all occupied positions (excluding group pieces)
  const occupiedPositions = new Set<number>();
  for (const piece of pieces) {
    if (!groupPieceIds.has(piece.id)) {
      occupiedPositions.add(piece.currentPosition);
    }
  }

  // Check for collisions and push displaced pieces
  const displacedPieces: Array<{ id: number; oldPos: number; newPos: number }> = [];
  const total = pieces.length;

  for (const [, newPos] of newGroupPositions.entries()) {
    if (occupiedPositions.has(newPos)) {
      // Find the piece currently at this position
      const displacedPiece = pieces.find((p) => p.currentPosition === newPos && !groupPieceIds.has(p.id));
      if (displacedPiece) {
        // Find a free position for the displaced piece
        const freePos = findNearestFreePosition(newPos, occupiedPositions, gridSize, total);
        if (freePos === null) {
          return { pieces, groups }; // Cannot resolve collision, abort
        }
        displacedPieces.push({ id: displacedPiece.id, oldPos: displacedPiece.currentPosition, newPos: freePos });
        occupiedPositions.delete(displacedPiece.currentPosition);
        occupiedPositions.add(freePos);
      }
    }
    occupiedPositions.add(newPos);
  }

  // Apply all position changes
  const updatedPieces = pieces.map((piece) => {
    if (groupPieceIds.has(piece.id)) {
      return { ...piece, currentPosition: newGroupPositions.get(piece.id)! };
    }
    const displacement = displacedPieces.find((d) => d.id === piece.id);
    if (displacement) {
      return { ...piece, currentPosition: displacement.newPos };
    }
    return piece;
  });

  // Update group positions
  const updatedGroups = groups.map((g) => {
    if (g.id === groupId) {
      const gPieces = updatedPieces.filter((p) => p.groupId === g.id);
      return { ...g, positions: gPieces.map((p) => p.currentPosition) };
    }
    return g;
  });

  return { pieces: updatedPieces, groups: updatedGroups };
}
