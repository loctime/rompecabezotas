// src/hooks/useGameState.js
import { useState, useCallback, useEffect } from 'react';
import {
  generatePuzzlePieces,
  generateInitialGroups,
  swapPiecesOrGroups,
  checkAndMergeAdjacentGroups,
  isPuzzleComplete
} from '../utils/puzzleLogic';

export const useGameState = (level) => {
  const [pieces, setPieces] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(null);
  
  // Inicializar el puzzle cuando cambia el nivel
  useEffect(() => {
    if (level) {
      const initialPieces = generatePuzzlePieces(level.gridSize);
      const initialGroups = generateInitialGroups(initialPieces);
      setPieces(initialPieces);
      setGroups(initialGroups);
      setSelectedPiece(null);
      setIsComplete(false);
      setMoves(0);
      setStartTime(Date.now());
    }
  }, [level]);
  
  // Seleccionar o intercambiar pieza
  const handlePieceClick = useCallback((pieceId) => {
    if (isComplete) return;
    
    if (selectedPiece === null) {
      // Primera pieza seleccionada
      setSelectedPiece(pieceId);
    } else if (selectedPiece === pieceId) {
      // Deseleccionar si se clickea la misma pieza
      setSelectedPiece(null);
    } else {
      // Intercambiar piezas/grupos
      const { pieces: swappedPieces, groups: swappedGroups } = 
        swapPiecesOrGroups(pieces, groups, selectedPiece, pieceId);
      
      // Verificar y fusionar grupos adyacentes
      const { pieces: finalPieces, groups: finalGroups } = 
        checkAndMergeAdjacentGroups(swappedPieces, swappedGroups, level.gridSize);
      
      setPieces(finalPieces);
      setGroups(finalGroups);
      setSelectedPiece(null);
      setMoves(prev => prev + 1);
      
      // Verificar si se completó el puzzle
      if (isPuzzleComplete(finalPieces)) {
        setIsComplete(true);
      }
    }
  }, [selectedPiece, pieces, groups, isComplete, level]);
  
  // Reiniciar nivel
  const resetLevel = useCallback(() => {
    if (level) {
      const initialPieces = generatePuzzlePieces(level.gridSize);
      const initialGroups = generateInitialGroups(initialPieces);
      setPieces(initialPieces);
      setGroups(initialGroups);
      setSelectedPiece(null);
      setIsComplete(false);
      setMoves(0);
      setStartTime(Date.now());
    }
  }, [level]);
  
  return {
    pieces,
    groups,
    selectedPiece,
    isComplete,
    moves,
    startTime,
    handlePieceClick,
    resetLevel
  };
};
