// src/components/GameScreen.jsx
import { Header } from './Header';
import { GameBoard } from './GameBoard';
import { VictoryModal } from './VictoryModal';
import { useGameState } from '../hooks/useGameState';
import { completeLevel } from '../data/levels';
import { useEffect } from 'react';

export const GameScreen = ({ level, onBack, onNextLevel }) => {
  const {
    pieces,
    groups,
    selectedPiece,
    isComplete,
    moves,
    startTime,
    handlePieceClick,
    resetLevel
  } = useGameState(level);
  
  useEffect(() => {
    if (isComplete) {
      completeLevel(level.id);
    }
  }, [isComplete, level.id]);
  
  const handleNextLevel = () => {
    const nextLevel = level.id + 1;
    onNextLevel(nextLevel);
  };
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4A9B8E 0%, #2D5F56 100%)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Header 
        levelNumber={level.id}
        onSettings={() => console.log('Settings')}
        showBackButton={true}
        onBack={onBack}
      />
      
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        gap: '20px',
      }}>
        <div style={{
          color: 'white',
          fontSize: '18px',
          textAlign: 'center',
          marginBottom: '10px',
        }}>
          <div style={{ 
            fontWeight: 'bold', 
            fontSize: '14px', 
            opacity: 0.8,
            marginBottom: '5px',
          }}>
            {level.title}
          </div>
          <div>
            Movimientos: <span style={{ fontWeight: 'bold' }}>{moves}</span>
          </div>
        </div>
        
        <GameBoard
          pieces={pieces}
          groups={groups}
          selectedPiece={selectedPiece}
          imageUrl={level.imageUrl}
          gridSize={level.gridSize}
          onPieceClick={handlePieceClick}
        />
        
        <button
          onClick={resetLevel}
          style={{
            padding: '12px 32px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          Reiniciar
        </button>
      </div>
      
      <VictoryModal
        isOpen={isComplete}
        moves={moves}
        time={startTime ? Date.now() - startTime : 0}
        onNextLevel={handleNextLevel}
        onRetry={resetLevel}
      />
    </div>
  );
};
