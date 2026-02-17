import type { Level } from '../types';

/**
 * Static level definitions.
 * gridSize N means N×N grid (3→9 pieces, 4→16 pieces, 5→25 pieces).
 * All unlocked/completed flags start as false; progress is applied at runtime
 * via applyProgress() + applyUnlocks() — never mutate this array directly.
 */
export const LEVELS: readonly Level[] = [
  // ── EASY: 3×3 (9 pieces) ─── Levels 1–10 ───────────────────────────────────
  { id: 1,  title: 'Amanecer Dorado',    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', gridSize: 3, unlocked: true,  completed: false },
  { id: 2,  title: 'Globos al Amanecer', imageUrl: 'https://images.unsplash.com/photo-1498663781446-eab3af1bb474?w=800', gridSize: 3, unlocked: false, completed: false },
  { id: 3,  title: 'Bosque de Niebla',   imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800', gridSize: 3, unlocked: false, completed: false },
  { id: 4,  title: 'Playa Tropical',     imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', gridSize: 3, unlocked: false, completed: false },
  { id: 5,  title: 'Montañas Nevadas',   imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800', gridSize: 3, unlocked: false, completed: false },
  { id: 6,  title: 'Ciudad Nocturna',    imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800', gridSize: 3, unlocked: false, completed: false },
  { id: 7,  title: 'Campos de Lavanda',  imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800', gridSize: 3, unlocked: false, completed: false },
  { id: 8,  title: 'Cascada Escondida',  imageUrl: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800', gridSize: 3, unlocked: false, completed: false },
  { id: 9,  title: 'Desierto de Fuego',  imageUrl: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800', gridSize: 3, unlocked: false, completed: false },
  { id: 10, title: 'Aurora Boreal',      imageUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800', gridSize: 3, unlocked: false, completed: false },

  // ── MEDIUM: 4×4 (16 pieces) ─── Levels 11–20 ────────────────────────────────
  { id: 11, title: 'Templo Japonés',     imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800', gridSize: 4, unlocked: false, completed: false },
  { id: 12, title: 'Venecia Romántica',  imageUrl: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800', gridSize: 4, unlocked: false, completed: false },
  { id: 13, title: 'Safari Africano',    imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800', gridSize: 4, unlocked: false, completed: false },
  { id: 14, title: 'Jardín Zen',         imageUrl: 'https://images.unsplash.com/photo-1563518094622-e7ccb9089b05?w=800', gridSize: 4, unlocked: false, completed: false },
  { id: 15, title: 'Faro en Tormenta',   imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800', gridSize: 4, unlocked: false, completed: false },
  { id: 16, title: 'Mercado Árabe',      imageUrl: 'https://images.unsplash.com/photo-1564859227225-dc8b6e8c0e37?w=800', gridSize: 4, unlocked: false, completed: false },
  { id: 17, title: 'Cataratas Iguazú',   imageUrl: 'https://images.unsplash.com/photo-1562839406-a5c65cb5dd89?w=800', gridSize: 4, unlocked: false, completed: false },
  { id: 18, title: 'Pirámides Egipcias', imageUrl: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800', gridSize: 4, unlocked: false, completed: false },
  { id: 19, title: 'Glaciar Azul',       imageUrl: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?w=800', gridSize: 4, unlocked: false, completed: false },
  { id: 20, title: 'Puente Golden Gate', imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800', gridSize: 4, unlocked: false, completed: false },

  // ── HARD: 5×5 (25 pieces) ─── Levels 21–30 ──────────────────────────────────
  { id: 21, title: 'Machu Picchu',       imageUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800', gridSize: 5, unlocked: false, completed: false },
  { id: 22, title: 'Santorini Azul',     imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800', gridSize: 5, unlocked: false, completed: false },
  { id: 23, title: 'Río Amazónico',      imageUrl: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800', gridSize: 5, unlocked: false, completed: false },
  { id: 24, title: 'Bali Espiritual',    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', gridSize: 5, unlocked: false, completed: false },
  { id: 25, title: 'Islandia Volcánica', imageUrl: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=800', gridSize: 5, unlocked: false, completed: false },
  { id: 26, title: 'Gran Cañón',         imageUrl: 'https://images.unsplash.com/photo-1527489377706-5bf97e608852?w=800', gridSize: 5, unlocked: false, completed: false },
  { id: 27, title: 'Noruega Fiordos',    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800', gridSize: 5, unlocked: false, completed: false },
  { id: 28, title: 'Patagonia Infinita', imageUrl: 'https://images.unsplash.com/photo-1516298773066-c48f8e9aca9a?w=800', gridSize: 5, unlocked: false, completed: false },
  { id: 29, title: 'Maldivas Cristal',   imageUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800', gridSize: 5, unlocked: false, completed: false },
  { id: 30, title: 'Nepal Himalaya',     imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800', gridSize: 5, unlocked: false, completed: false },
];

export function getLevel(id: number): Level | undefined {
  return LEVELS.find((l) => l.id === id);
}
