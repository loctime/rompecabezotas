import type { Level } from '../types';

/**
 * Static level definitions.
 * gridSize N means N×N grid (3→9 pieces, 4→16 pieces, 5→25 pieces).
 * All unlocked/completed flags start as false; progress is applied at runtime
 * via applyProgress() + applyUnlocks() — never mutate this array directly.
 */
/**
 * Helper function to get image URL for a level
 * Images are stored in /public/images/levels/level-{id}.png
 */
function getImageUrl(levelId: number): string {
  return `/images/levels/level-${levelId}.png`;
}

export const LEVELS: readonly Level[] = [
  // ── EASY: 3×3 (9 pieces) ─── Levels 1–10 ───────────────────────────────────
  { id: 1,  title: 'Amanecer Dorado',    imageUrl: getImageUrl(1), gridSize: 3, unlocked: true,  completed: false },
  { id: 2,  title: 'Globos al Amanecer', imageUrl: getImageUrl(2), gridSize: 3, unlocked: false, completed: false },
  { id: 3,  title: 'Bosque de Niebla',   imageUrl: getImageUrl(3), gridSize: 3, unlocked: false, completed: false },
  { id: 4,  title: 'Playa Tropical',     imageUrl: getImageUrl(4), gridSize: 3, unlocked: false, completed: false },
  { id: 5,  title: 'Montañas Nevadas',   imageUrl: getImageUrl(5), gridSize: 3, unlocked: false, completed: false },
  { id: 6,  title: 'Ciudad Nocturna',    imageUrl: getImageUrl(6), gridSize: 3, unlocked: false, completed: false },
  { id: 7,  title: 'Campos de Lavanda',  imageUrl: getImageUrl(7), gridSize: 3, unlocked: false, completed: false },
  { id: 8,  title: 'Cascada Escondida',  imageUrl: getImageUrl(8), gridSize: 3, unlocked: false, completed: false },
  { id: 9,  title: 'Desierto de Fuego',  imageUrl: getImageUrl(9), gridSize: 3, unlocked: false, completed: false },
  { id: 10, title: 'Aurora Boreal',      imageUrl: getImageUrl(10), gridSize: 3, unlocked: false, completed: false },

  // ── MEDIUM: 4×4 (16 pieces) ─── Levels 11–20 ────────────────────────────────
  { id: 11, title: 'Templo Japonés',     imageUrl: getImageUrl(11), gridSize: 4, unlocked: false, completed: false },
  { id: 12, title: 'Venecia Romántica',  imageUrl: getImageUrl(12), gridSize: 4, unlocked: false, completed: false },
  { id: 13, title: 'Safari Africano',    imageUrl: getImageUrl(13), gridSize: 4, unlocked: false, completed: false },
  { id: 14, title: 'Jardín Zen',         imageUrl: getImageUrl(14), gridSize: 4, unlocked: false, completed: false },
  { id: 15, title: 'Faro en Tormenta',   imageUrl: getImageUrl(15), gridSize: 4, unlocked: false, completed: false },
  { id: 16, title: 'Mercado Árabe',      imageUrl: getImageUrl(16), gridSize: 4, unlocked: false, completed: false },
  { id: 17, title: 'Cataratas Iguazú',   imageUrl: getImageUrl(17), gridSize: 4, unlocked: false, completed: false },
  { id: 18, title: 'Pirámides Egipcias', imageUrl: getImageUrl(18), gridSize: 4, unlocked: false, completed: false },
  { id: 19, title: 'Glaciar Azul',       imageUrl: getImageUrl(19), gridSize: 4, unlocked: false, completed: false },
  { id: 20, title: 'Puente Golden Gate', imageUrl: getImageUrl(20), gridSize: 4, unlocked: false, completed: false },

  // ── HARD: 5×5 (25 pieces) ─── Levels 21–30 ──────────────────────────────────
  { id: 21, title: 'Machu Picchu',       imageUrl: getImageUrl(21), gridSize: 5, unlocked: false, completed: false },
  { id: 22, title: 'Santorini Azul',     imageUrl: getImageUrl(22), gridSize: 5, unlocked: false, completed: false },
  { id: 23, title: 'Río Amazónico',      imageUrl: getImageUrl(23), gridSize: 5, unlocked: false, completed: false },
  { id: 24, title: 'Bali Espiritual',    imageUrl: getImageUrl(24), gridSize: 5, unlocked: false, completed: false },
  { id: 25, title: 'Islandia Volcánica', imageUrl: getImageUrl(25), gridSize: 5, unlocked: false, completed: false },
  { id: 26, title: 'Gran Cañón',         imageUrl: getImageUrl(26), gridSize: 5, unlocked: false, completed: false },
  { id: 27, title: 'Noruega Fiordos',    imageUrl: getImageUrl(27), gridSize: 5, unlocked: false, completed: false },
  { id: 28, title: 'Patagonia Infinita', imageUrl: getImageUrl(28), gridSize: 5, unlocked: false, completed: false },
  { id: 29, title: 'Maldivas Cristal',   imageUrl: getImageUrl(29), gridSize: 5, unlocked: false, completed: false },
  { id: 30, title: 'Nepal Himalaya',     imageUrl: getImageUrl(30), gridSize: 5, unlocked: false, completed: false },
];

export function getLevel(id: number): Level | undefined {
  return LEVELS.find((l) => l.id === id);
}
