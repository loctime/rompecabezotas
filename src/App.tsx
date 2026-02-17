import { useState, useCallback } from 'react';
import type { Level } from './types';
import { LEVELS } from './data/levels';
import { applyProgress, applyUnlocks, recordLevelComplete } from './utils/progress';
import { LevelSelector } from './components/LevelSelector';
import { GameScreen } from './components/GameScreen';

function App() {
  // Levels with progress applied — single source of truth, no global mutation
  const [levels, setLevels] = useState<Level[]>(() =>
    applyUnlocks(applyProgress(LEVELS))
  );
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);

  const handleSelectLevel = useCallback((level: Level) => {
    // Always use the latest level data from state (not stale closure)
    setCurrentLevel(levels.find((l) => l.id === level.id) ?? level);
  }, [levels]);

  const handleBack = useCallback(() => {
    setCurrentLevel(null);
  }, []);

  const handleNextLevel = useCallback((nextId: number) => {
    const next = levels.find((l) => l.id === nextId);
    setCurrentLevel(next ?? null); // null → back to selector if no next level
  }, [levels]);

  const handleLevelComplete = useCallback((levelId: number, moves: number, timeMs: number) => {
    setLevels((prev) => recordLevelComplete(prev, levelId, moves, timeMs));
  }, []);

  return (
    <>
      {currentLevel ? (
        <GameScreen
          level={currentLevel}
          onBack={handleBack}
          onNextLevel={handleNextLevel}
          onLevelComplete={handleLevelComplete}
        />
      ) : (
        <LevelSelector levels={levels} onSelectLevel={handleSelectLevel} />
      )}
    </>
  );
}

export default App;
