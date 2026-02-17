/**
 * Star rating system.
 *
 * Stars are based on moves relative to the "par" for each grid size.
 * Par = minimum realistic moves to solve (empirically tuned per difficulty).
 *
 * 3 stars: moves <= par
 * 2 stars: moves <= par * 2
 * 1 star:  any completion
 */

const PAR_BY_GRID_SIZE: Record<number, number> = {
  3: 12,  // 9 pieces  — casual player solves in ~12 moves
  4: 30,  // 16 pieces — ~30 moves
  5: 60,  // 25 pieces — ~60 moves
};

export function calculateStars(moves: number, gridSize: number): 1 | 2 | 3 {
  const par = PAR_BY_GRID_SIZE[gridSize] ?? gridSize * gridSize * 1.5;
  if (moves <= par) return 3;
  if (moves <= par * 2) return 2;
  return 1;
}

/** Returns the par move count for a given gridSize */
export function getParMoves(gridSize: number): number {
  return PAR_BY_GRID_SIZE[gridSize] ?? Math.round(gridSize * gridSize * 1.5);
}
