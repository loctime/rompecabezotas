import { useState, useCallback, useMemo } from 'react';
import type { Level } from './types';
import { LEVELS } from './data/levels';
import { applyProgress, applyUnlocks, recordLevelComplete } from './utils/progress';
import { loadGlobalStats, recordCompletion } from './utils/globalStats';
import { getTodayChallenge, completeTodayChallenge } from './utils/daily';
import { LevelSelector } from './components/LevelSelector';
import { GameScreen } from './components/GameScreen';

type GameMode = 'normal' | 'daily';

function App() {
  // ── State ────────────────────────────────────────────────────────────────────

  const [levels, setLevels] = useState<Level[]>(() =>
    applyUnlocks(applyProgress(LEVELS))
  );

  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('normal');

  const [daily, setDaily] = useState(() => getTodayChallenge());
  const [globalStats, setGlobalStats] = useState(() => loadGlobalStats());

  // ── Navigation ───────────────────────────────────────────────────────────────

  const handleSelectLevel = useCallback((level: Level) => {
    setCurrentLevel(levels.find((l) => l.id === level.id) ?? level);
    setGameMode('normal');
  }, [levels]);

  const handlePlayDaily = useCallback(() => {
    const dailyLevelDef = LEVELS.find((l) => l.id === daily.levelId);
    if (!dailyLevelDef) return;
    // Use the base level def (not progress-applied) so daily always starts fresh
    setCurrentLevel({ ...dailyLevelDef, unlocked: true });
    setGameMode('daily');
  }, [daily.levelId]);

  const handleBack = useCallback(() => {
    setCurrentLevel(null);
    setGameMode('normal');
  }, []);

  const handleNextLevel = useCallback((nextId: number) => {
    if (gameMode === 'daily') {
      setCurrentLevel(null);
      setGameMode('normal');
      return;
    }
    const next = levels.find((l) => l.id === nextId);
    setCurrentLevel(next ?? null);
  }, [levels, gameMode]);

  // ── Completion ────────────────────────────────────────────────────────────────

  const handleLevelComplete = useCallback((
    levelId: number,
    moves: number,
    timeMs: number,
    stars: number,
    isNewRecord: boolean,
  ) => {
    // 1. Update level progress (only for normal levels, not daily)
    if (gameMode === 'normal') {
      const level = levels.find((l) => l.id === levelId);
      const gridSize = level?.gridSize ?? 3;
      const { levels: updatedLevels } = recordLevelComplete(
        levels, levelId, moves, timeMs, gridSize
      );
      setLevels(updatedLevels);
    }

    // 2. Mark daily as done
    if (gameMode === 'daily') {
      completeTodayChallenge();
      setDaily((d) => ({ ...d, completed: true }));
    }

    // 3. Update global stats
    const updatedStats = recordCompletion(moves, timeMs, stars, isNewRecord, gameMode === 'daily');
    setGlobalStats(updatedStats);
  }, [levels, gameMode]);

  // ── Derived ───────────────────────────────────────────────────────────────────

  const selectorProps = useMemo(() => ({
    levels,
    daily,
    globalStats,
    onSelectLevel: handleSelectLevel,
    onPlayDaily: handlePlayDaily,
  }), [levels, daily, globalStats, handleSelectLevel, handlePlayDaily]);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      {currentLevel ? (
        <GameScreen
          level={currentLevel}
          isDaily={gameMode === 'daily'}
          onBack={handleBack}
          onNextLevel={handleNextLevel}
          onLevelComplete={handleLevelComplete}
        />
      ) : (
        <LevelSelector {...selectorProps} />
      )}
    </>
  );
}

export default App;
