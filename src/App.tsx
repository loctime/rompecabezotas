import { useCallback, useMemo, useState } from 'react';
import type { Level } from './types';
import { LEVELS } from './data/levels';
import { applyProgress, applyUnlocks, recordLevelComplete } from './utils/progress';
import { completeTodayChallenge, getTodayChallenge } from './utils/daily';
import { loadGlobalStats, recordCompletion, recordDailyCompletion } from './utils/globalStats';
import { LevelSelector } from './components/LevelSelector';
import { GameScreen } from './components/GameScreen';

type GameMode = 'level' | 'daily';

function App() {
  const [levels, setLevels] = useState<Level[]>(() => applyUnlocks(applyProgress(LEVELS)));
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [mode, setMode] = useState<GameMode>('level');
  const [daily, setDaily] = useState(() => getTodayChallenge());
  const [globalStats, setGlobalStats] = useState(() => loadGlobalStats());

  const handleSelectLevel = useCallback((level: Level) => {
    setCurrentLevel(levels.find((l) => l.id === level.id) ?? level);
    setMode('level');
  }, [levels]);

  const handlePlayDaily = useCallback(() => {
    const level = LEVELS.find((l) => l.id === daily.levelId);
    if (!level) return;
    setCurrentLevel({ ...level, unlocked: true, completed: false });
    setMode('daily');
  }, [daily.levelId]);

  const handleBack = useCallback(() => {
    setCurrentLevel(null);
    setMode('level');
    setDaily(getTodayChallenge());
  }, []);

  const handleNextLevel = useCallback((nextId: number) => {
    if (mode === 'daily') {
      setCurrentLevel(null);
      setMode('level');
      return;
    }
    const next = levels.find((l) => l.id === nextId);
    setCurrentLevel(next ?? null);
  }, [levels, mode]);

  const handleLevelComplete = useCallback((
    levelId: number,
    moves: number,
    timeMs: number,
    _stars: number,
    _isNewRecord: boolean
  ) => {
    if (mode === 'level') {
      const level = levels.find((l) => l.id === levelId);
      const result = recordLevelComplete(levels, levelId, moves, timeMs, level?.gridSize ?? 3);
      setLevels(result.levels);
    } else {
      completeTodayChallenge();
      const streakStats = recordDailyCompletion();
      setDaily((prev) => ({ ...prev, completed: true }));
      setGlobalStats((prev) => ({ ...prev, ...streakStats }));
    }

    const stats = recordCompletion(moves, timeMs);
    setGlobalStats(stats);
  }, [mode, levels]);

  const selectorProps = useMemo(() => ({
    levels,
    daily,
    globalStats,
    onSelectLevel: handleSelectLevel,
    onPlayDaily: handlePlayDaily,
  }), [levels, daily, globalStats, handleSelectLevel, handlePlayDaily]);

  return currentLevel ? (
    <GameScreen
      level={currentLevel}
      isDaily={mode === 'daily'}
      onBack={handleBack}
      onNextLevel={handleNextLevel}
      onLevelComplete={handleLevelComplete}
    />
  ) : (
    <LevelSelector {...selectorProps} />
  );
}

export default App;
