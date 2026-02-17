// src/components/GameBoard.jsx
import { PuzzlePiece } from './PuzzlePiece';
import { motion } from 'framer-motion';

export const GameBoard = ({ 
  pieces, 
  groups,
  selectedPiece, 
  imageUrl, 
  gridSize, 
  onPieceClick 
}) => {
  // Determinar qué piezas están en un grupo
  const getPieceGroupSize = (pieceId) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) return 1;
    
    const group = groups.find(g => g.id === piece.groupId);
    return group ? group.pieceIds.length : 1;
  };
  
  return (
    <div className="game-board-container">
      <motion.div 
        className="game-board"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '500px',
          aspectRatio: '1',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        {pieces.map((piece) => (
          <PuzzlePiece
            key={piece.id}
            piece={piece}
            imageUrl={imageUrl}
            gridSize={gridSize}
            isSelected={selectedPiece === piece.id}
            isInGroup={getPieceGroupSize(piece.id) > 1}
            onClick={() => onPieceClick(piece.id)}
          />
        ))}
        
        {/* Renderizar bordes de grupos fusionados */}
        {groups.filter(g => g.pieceIds.length > 1).map(group => {
          // Aquí podrías agregar visualización especial para grupos grandes
          return null;
        })}
      </motion.div>
    </div>
  );
};
