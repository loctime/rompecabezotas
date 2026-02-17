const PAR_BY_GRID_SIZE: Record<number, number> = {
  3: 12,
  4: 30,
  5: 60,
};

export function calculateStars(moves: number, gridSize: number): 1 | 2 | 3 {
  const par = PAR_BY_GRID_SIZE[gridSize] ?? Math.round(gridSize * gridSize * 1.5);
  if (moves <= par) return 3;
  if (moves <= par * 2) return 2;
  return 1;
}

export function getParMoves(gridSize: number): number {
  return PAR_BY_GRID_SIZE[gridSize] ?? Math.round(gridSize * gridSize * 1.5);
}
