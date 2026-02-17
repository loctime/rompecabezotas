// src/types/game.types.js

/**
 * @typedef {Object} PuzzlePiece
 * @property {number} id - ID único de la pieza
 * @property {number} currentPosition - Posición actual en el grid (0-8 para 3x3)
 * @property {number} correctPosition - Posición correcta en el grid
 * @property {number} groupId - ID del grupo al que pertenece
 * @property {number} row - Fila en la imagen original
 * @property {number} col - Columna en la imagen original
 */

/**
 * @typedef {Object} PieceGroup
 * @property {number} id - ID único del grupo
 * @property {number[]} pieceIds - IDs de las piezas en el grupo
 * @property {number[]} positions - Posiciones ocupadas en el grid
 */

/**
 * @typedef {Object} Level
 * @property {number} id - ID del nivel
 * @property {string} imageUrl - URL de la imagen del nivel
 * @property {string} title - Título del nivel
 * @property {number} gridSize - Tamaño del grid (3 para 3x3, 4 para 4x4, etc)
 * @property {boolean} completed - Si el nivel está completado
 * @property {boolean} unlocked - Si el nivel está desbloqueado
 */

/**
 * @typedef {Object} GameState
 * @property {number} currentLevel - Nivel actual
 * @property {PuzzlePiece[]} pieces - Piezas del puzzle
 * @property {PieceGroup[]} groups - Grupos de piezas fusionadas
 * @property {number|null} selectedPiece - ID de la pieza seleccionada
 * @property {boolean} isComplete - Si el puzzle está completo
 * @property {number} moves - Número de movimientos
 * @property {number} startTime - Timestamp de inicio
 */

export {}
