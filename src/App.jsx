// src/App.jsx
import { useState } from 'react';
import { LevelSelector } from './components/LevelSelector';
import { GameScreen } from './components/GameScreen';
import { getLevel } from './data/levels';
import './App.css';

function App() {
  const [currentLevel, setCurrentLevel] = useState(null);
  
  const handleSelectLevel = (level) => {
    setCurrentLevel(level);
  };
  
  const handleBack = () => {
    setCurrentLevel(null);
  };
  
  const handleNextLevel = (levelId) => {
    const nextLevel = getLevel(levelId);
    if (nextLevel) {
      setCurrentLevel(nextLevel);
    } else {
      // No hay más niveles, volver al selector
      setCurrentLevel(null);
    }
  };
  
  return (
    <div className="App">
      {currentLevel ? (
        <GameScreen
          level={currentLevel}
          onBack={handleBack}
          onNextLevel={handleNextLevel}
        />
      ) : (
        <LevelSelector onSelectLevel={handleSelectLevel} />
      )}
    </div>
  );
}

export default App;
