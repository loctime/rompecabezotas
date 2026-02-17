// src/components/PuzzlePiece.jsx
import { motion } from 'framer-motion';

export const PuzzlePiece = ({ 
  piece, 
  imageUrl, 
  gridSize, 
  isSelected, 
  isInGroup,
  onClick 
}) => {
  const pieceSize = 100 / gridSize;
  
  // Calcular la posición en el grid actual
  const currentRow = Math.floor(piece.currentPosition / gridSize);
  const currentCol = piece.currentPosition % gridSize;
  
  // Calcular la posición de la imagen (basado en la posición correcta)
  const imageRow = piece.row;
  const imageCol = piece.col;
  
  const isCorrect = piece.currentPosition === piece.correctPosition;
  
  return (
    <motion.div
      layout
      onClick={onClick}
      className="piece-container"
      style={{
        position: 'absolute',
        width: `${pieceSize}%`,
        height: `${pieceSize}%`,
        left: `${currentCol * pieceSize}%`,
        top: `${currentRow * pieceSize}%`,
        cursor: 'pointer',
        padding: '2px',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: piece.id * 0.02
      }}
    >
      <div
        className={`piece ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''}`}
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
          backgroundPosition: `${imageCol * 100}% ${imageRow * 100}%`,
          borderRadius: '8px',
          border: isSelected ? '3px solid #FFD700' : isInGroup ? '2px solid rgba(74, 155, 142, 0.3)' : '2px solid rgba(74, 155, 142, 0.8)',
          boxShadow: isSelected 
            ? '0 8px 16px rgba(255, 215, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.3)'
            : isInGroup 
            ? '0 2px 4px rgba(0, 0, 0, 0.1)'
            : '0 4px 8px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.3s ease',
          transform: isSelected ? 'scale(1.05)' : 'scale(1)',
        }}
      />
    </motion.div>
  );
};
