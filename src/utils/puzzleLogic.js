// src/utils/puzzleLogic.js

/**
 * Mezcla un array usando el algoritmo Fisher-Yates
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Genera las piezas iniciales del puzzle
 */
export const generatePuzzlePieces = (gridSize) => {
  const totalPieces = gridSize * gridSize;
  const pieces = [];
  
  for (let i = 0; i < totalPieces; i++) {
    pieces.push({
      id: i,
      correctPosition: i,
      currentPosition: i,
      groupId: i, // Inicialmente cada pieza es su propio grupo
      row: Math.floor(i / gridSize),
      col: i % gridSize
    });
  }
  
  // Mezclar posiciones
  const shuffledPositions = shuffleArray([...Array(totalPieces).keys()]);
  pieces.forEach((piece, index) => {
    piece.currentPosition = shuffledPositions[index];
  });
  
  return pieces;
};

/**
 * Genera los grupos iniciales (cada pieza es su propio grupo)
 */
export const generateInitialGroups = (pieces) => {
  return pieces.map(piece => ({
    id: piece.id,
    pieceIds: [piece.id],
    positions: [piece.currentPosition]
  }));
};

/**
 * Obtiene las posiciones adyacentes en el grid
 */
export const getAdjacentPositions = (position, gridSize) => {
  const row = Math.floor(position / gridSize);
  const col = position % gridSize;
  const adjacent = [];
  
  // Arriba
  if (row > 0) adjacent.push(position - gridSize);
  // Abajo
  if (row < gridSize - 1) adjacent.push(position + gridSize);
  // Izquierda
  if (col > 0) adjacent.push(position - 1);
  // Derecha
  if (col < gridSize - 1) adjacent.push(position + 1);
  
  return adjacent;
};

/**
 * Verifica si dos piezas son adyacentes en la imagen original
 */
export const areAdjacentInOriginal = (piece1, piece2, gridSize) => {
  const row1 = Math.floor(piece1.correctPosition / gridSize);
  const col1 = piece1.correctPosition % gridSize;
  const row2 = Math.floor(piece2.correctPosition / gridSize);
  const col2 = piece2.correctPosition % gridSize;
  
  // Son adyacentes si están en la misma fila y columnas contiguas, o misma columna y filas contiguas
  const sameRow = row1 === row2 && Math.abs(col1 - col2) === 1;
  const sameCol = col1 === col2 && Math.abs(row1 - row2) === 1;
  
  return sameRow || sameCol;
};

/**
 * Verifica si dos posiciones son adyacentes en el grid actual
 */
export const arePositionsAdjacent = (pos1, pos2, gridSize) => {
  const row1 = Math.floor(pos1 / gridSize);
  const col1 = pos1 % gridSize;
  const row2 = Math.floor(pos2 / gridSize);
  const col2 = pos2 % gridSize;
  
  const sameRow = row1 === row2 && Math.abs(col1 - col2) === 1;
  const sameCol = col1 === col2 && Math.abs(row1 - row2) === 1;
  
  return sameRow || sameCol;
};

/**
 * Verifica si una pieza está en su posición correcta
 */
export const isPieceCorrect = (piece) => {
  return piece.currentPosition === piece.correctPosition;
};

/**
 * Verifica si el puzzle está completo
 */
export const isPuzzleComplete = (pieces) => {
  return pieces.every(piece => isPieceCorrect(piece));
};

/**
 * Fusiona dos grupos en uno solo
 */
export const mergeGroups = (groups, groupId1, groupId2) => {
  const group1 = groups.find(g => g.id === groupId1);
  const group2 = groups.find(g => g.id === groupId2);
  
  if (!group1 || !group2 || groupId1 === groupId2) return groups;
  
  // Crear nuevo grupo fusionado
  const mergedGroup = {
    id: Math.min(groupId1, groupId2), // Usar el ID menor
    pieceIds: [...group1.pieceIds, ...group2.pieceIds],
    positions: [...group1.positions, ...group2.positions]
  };
  
  // Eliminar grupos antiguos y agregar el fusionado
  return [
    ...groups.filter(g => g.id !== groupId1 && g.id !== groupId2),
    mergedGroup
  ];
};

/**
 * Actualiza los groupIds de las piezas después de fusionar
 */
export const updatePieceGroupIds = (pieces, newGroups) => {
  return pieces.map(piece => {
    const group = newGroups.find(g => g.pieceIds.includes(piece.id));
    return {
      ...piece,
      groupId: group ? group.id : piece.id
    };
  });
};

/**
 * Verifica y fusiona grupos adyacentes que estén en posición correcta
 */
export const checkAndMergeAdjacentGroups = (pieces, groups, gridSize) => {
  let mergedGroups = [...groups];
  let changed = true;
  
  // Repetir hasta que no haya más fusiones
  while (changed) {
    changed = false;
    
    for (let i = 0; i < pieces.length; i++) {
      const piece = pieces[i];
      
      // Solo verificar si la pieza está en posición correcta
      if (!isPieceCorrect(piece)) continue;
      
      const adjacentPositions = getAdjacentPositions(piece.currentPosition, gridSize);
      
      for (const adjPos of adjacentPositions) {
        const adjacentPiece = pieces.find(p => p.currentPosition === adjPos);
        
        if (!adjacentPiece || !isPieceCorrect(adjacentPiece)) continue;
        
        // Verificar si son adyacentes en la imagen original
        if (areAdjacentInOriginal(piece, adjacentPiece, gridSize)) {
          // Si están en grupos diferentes, fusionar
          if (piece.groupId !== adjacentPiece.groupId) {
            mergedGroups = mergeGroups(mergedGroups, piece.groupId, adjacentPiece.groupId);
            changed = true;
          }
        }
      }
    }
    
    // Actualizar groupIds de las piezas
    if (changed) {
      pieces = updatePieceGroupIds(pieces, mergedGroups);
    }
  }
  
  return { pieces, groups: mergedGroups };
};

/**
 * Obtiene todas las piezas de un grupo
 */
export const getGroupPieces = (pieces, groupId) => {
  return pieces.filter(piece => piece.groupId === groupId);
};

/**
 * Intercambia las posiciones de dos piezas o grupos
 */
export const swapPiecesOrGroups = (pieces, groups, pieceId1, pieceId2) => {
  const piece1 = pieces.find(p => p.id === pieceId1);
  const piece2 = pieces.find(p => p.id === pieceId2);
  
  if (!piece1 || !piece2) return { pieces, groups };
  
  const group1Pieces = getGroupPieces(pieces, piece1.groupId);
  const group2Pieces = getGroupPieces(pieces, piece2.groupId);
  
  // Intercambiar posiciones de todos los piezas de ambos grupos
  const updatedPieces = pieces.map(piece => {
    if (group1Pieces.includes(piece)) {
      const offset = piece.currentPosition - piece1.currentPosition;
      return { ...piece, currentPosition: piece2.currentPosition + offset };
    }
    if (group2Pieces.includes(piece)) {
      const offset = piece.currentPosition - piece2.currentPosition;
      return { ...piece, currentPosition: piece1.currentPosition + offset };
    }
    return piece;
  });
  
  // Actualizar posiciones en los grupos
  const updatedGroups = groups.map(group => {
    const groupPieces = updatedPieces.filter(p => p.groupId === group.id);
    return {
      ...group,
      positions: groupPieces.map(p => p.currentPosition)
    };
  });
  
  return { pieces: updatedPieces, groups: updatedGroups };
};
