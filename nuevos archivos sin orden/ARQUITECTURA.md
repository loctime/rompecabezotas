# Jigsolitaire v2 — Arquitectura

## Estructura de archivos

```
src/
├── types/
│   └── index.ts              ← Todos los tipos TypeScript (PuzzlePiece, Level, GameState, etc.)
│
├── data/
│   └── levels.ts             ← 30 niveles (3×3, 4×4, 5×5). Solo lectura, nunca mutar.
│
├── utils/
│   ├── puzzleLogic.ts        ← Lógica pura del puzzle (sin React, testeable)
│   └── progress.ts           ← Gestión de progreso en localStorage (sin mutación global)
│
├── hooks/
│   └── useGameState.ts       ← Reducer-based game state con timer integrado
│
├── components/
│   ├── PuzzlePiece.tsx / .module.css
│   ├── GameBoard.tsx / .module.css
│   ├── GameScreen.tsx / .module.css
│   ├── VictoryModal.tsx / .module.css
│   └── LevelSelector.tsx / .module.css
│
├── styles/
│   └── global.css            ← Design tokens CSS variables + reset
│
├── App.tsx                   ← Navegación + estado de niveles (single source of truth)
└── main.tsx                  ← Entry point + SW registration
```

## Decisiones de arquitectura

### Estado del juego: Reducer pattern
`useGameState` usa `useReducer` en vez de múltiples `useState`.
- ✅ Transiciones de estado predecibles y auditables
- ✅ Cada acción es un objeto tipado (`GameAction`)
- ✅ Fácil de extender con nuevas acciones (ej: HINT, UNDO)

### Progreso: sin mutación global
`LEVELS` es `readonly`. El progreso se aplica en runtime con:
- `applyProgress(LEVELS)` → lee localStorage
- `applyUnlocks(levels)` → calcula qué niveles están desbloqueados
- `recordLevelComplete(...)` → escribe y retorna nuevos niveles
- El estado vive en `App.tsx`, no en un módulo global

### Lógica del puzzle: bugs corregidos
Correcciones respecto a v1:
1. **OOB check en swap**: si el offset de un grupo saca piezas fuera del tablero, el swap se aborta en lugar de corromper el estado
2. **Collision check**: verifica que las posiciones nuevas no colisionen con piezas no involucradas en el swap
3. **backgroundPosition**: fórmula corregida — antes usaba `col * 100` que daba resultados incorrectos en piezas de borde; ahora usa `col / (gridSize - 1) * 100`
4. **Merge loop**: usa mapas O(1) en vez de `find/filter` anidados en hot loops
5. **Shuffle garantizado**: re-shufflea si el resultado inicial ya está resuelto

### CSS: design tokens + CSS Modules
- Variables globales en `global.css` (colores, espaciado, radios, motion, sombras)
- Un `.module.css` por componente — zero inline styles en lógica de estado
- `@media (hover: hover)` en hover states — los móviles no ven estados hover falsos
- `min-height: 100dvh` — maneja correctamente la barra del navegador móvil

### Accesibilidad
- Botones reales (`<button>`) en lugar de `<div onClick>`
- `aria-label`, `aria-pressed`, `aria-live` en piezas y timer
- `role="dialog" aria-modal` en VictoryModal
- `role="grid"` en GameBoard
- Auto-focus al abrir modal (acceso por teclado)
- Focus visible con outline en todos los interactivos

## Próximos pasos (itinerary)

### Paso 2: Features incompletas → completar
- [ ] Sonido de merge (Web Audio API, sin librería)
- [ ] Sonido de victoria
- [ ] Bordes visuales de grupos fusionados en GameBoard
- [ ] Hint system (resaltar pieza correcta por 1s)

### Paso 3: Touch & drag
- [ ] Drag & drop con Pointer Events API (sin librería extra)
- [ ] Soporte táctil en móvil (touch gestures)

### Paso 4: Metajuego
- [ ] Pantalla de stats por nivel (best time, best moves)
- [ ] Sistema de estrellas (1-3 según movimientos)
- [ ] Daily challenge (nivel nuevo cada día)

## Para instalar y ejecutar

```bash
npm install
npm run dev       # desarrollo
npm run build     # producción
npm run typecheck # verificar tipos sin compilar
```
