// src/data/levels.js

export const LEVELS = [
  // Niveles 1-10: 3x3 (Fácil)
  { id: 1, title: "Amanecer Dorado", imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800", gridSize: 3, unlocked: true, completed: false },
  { id: 2, title: "Globos al Amanecer", imageUrl: "https://images.unsplash.com/photo-1498663781446-eab3af1bb474?w=800", gridSize: 3, unlocked: false, completed: false },
  { id: 3, title: "Bosque de Niebla", imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800", gridSize: 3, unlocked: false, completed: false },
  { id: 4, title: "Playa Tropical", imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", gridSize: 3, unlocked: false, completed: false },
  { id: 5, title: "Montañas Nevadas", imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800", gridSize: 3, unlocked: false, completed: false },
  { id: 6, title: "Ciudad Nocturna", imageUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800", gridSize: 3, unlocked: false, completed: false },
  { id: 7, title: "Campos de Lavanda", imageUrl: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800", gridSize: 3, unlocked: false, completed: false },
  { id: 8, title: "Cascada Escondida", imageUrl: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800", gridSize: 3, unlocked: false, completed: false },
  { id: 9, title: "Desierto de Fuego", imageUrl: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800", gridSize: 3, unlocked: false, completed: false },
  { id: 10, title: "Aurora Boreal", imageUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800", gridSize: 3, unlocked: false, completed: false },
  
  // Niveles 11-30: 4x3 (Medio)
  { id: 11, title: "Templo Japonés", imageUrl: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800", gridSize: 4, unlocked: false, completed: false },
  { id: 12, title: "Venecia Romántica", imageUrl: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800", gridSize: 4, unlocked: false, completed: false },
  { id: 13, title: "Safari Africano", imageUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800", gridSize: 4, unlocked: false, completed: false },
  { id: 14, title: "Jardín Zen", imageUrl: "https://images.unsplash.com/photo-1563518094622-e7ccb9089b05?w=800", gridSize: 4, unlocked: false, completed: false },
  { id: 15, title: "Faro en Tormenta", imageUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800", gridSize: 4, unlocked: false, completed: false },
  { id: 16, title: "Mercado Árabe", imageUrl: "https://images.unsplash.com/photo-1564859227225-dc8b6e8c0e37?w=800", gridSize: 4, unlocked: false, completed: false },
  { id: 17, title: "Cataratas Iguazú", imageUrl: "https://images.unsplash.com/photo-1562839406-a5c65cb5dd89?w=800", gridSize: 4, unlocked: false, completed: false },
  { id: 18, title: "Pirámides Egipcias", imageUrl: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800", gridSize: 4, unlocked: false, completed: false },
  { id: 19, title: "Glaciar Azul", imageUrl: "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=800", gridSize: 4, unlocked: false, completed: false },
  { id: 20, title: "Puente Golden Gate", imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800", gridSize: 4, unlocked: false, completed: false },
];

export const getLevel = (levelId) => {
  return LEVELS.find(level => level.id === levelId);
};

export const getLevelProgress = () => {
  const saved = localStorage.getItem('jigsolitaire_progress');
  if (saved) {
    return JSON.parse(saved);
  }
  return LEVELS;
};

export const saveLevelProgress = (levels) => {
  localStorage.setItem('jigsolitaire_progress', JSON.stringify(levels));
};

export const completeLevel = (levelId) => {
  const progress = getLevelProgress();
  const levelIndex = progress.findIndex(l => l.id === levelId);
  if (levelIndex !== -1) {
    progress[levelIndex].completed = true;
    // Desbloquear siguiente nivel
    if (levelIndex + 1 < progress.length) {
      progress[levelIndex + 1].unlocked = true;
    }
    saveLevelProgress(progress);
  }
  return progress;
};
