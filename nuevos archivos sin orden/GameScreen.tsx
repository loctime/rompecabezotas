import { useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Level } from '../types';
import { useGameState } from '../hooks/useGameState';
import { GameBoard } from './GameBoard';
import { VictoryModal } from './VictoryModal';
import styles from './GameScreen.module.css';

interface Props {
  level: Level;
  onBack: () => void;
  onNextLevel: (id: number) => void;
  onLevelComplete: (levelId: number, moves: number, timeMs: number) => void;
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

export function GameScreen({ level, onBack, onNextLevel, onLevelComplete }: Props) {
  const {
    pieces,
    groups,
    selectedPieceId,
    isComplete,
    moves,
    elapsedTime,
    handlePieceClick,
    resetLevel,
  } = useGameState(level);

  // Report completion once
  const handleVictoryOpen = useCallback(() => {
    onLevelComplete(level.id, moves, elapsedTime);
  }, [level.id, moves, elapsedTime, onLevelComplete]);

  // Trigger once when isComplete flips to true
  const prevComplete = { current: false };
  if (isComplete && !prevComplete.current) {
    prevComplete.current = true;
    handleVictoryOpen();
  }

  return (
    <div className={styles.screen}>
      {/* Header */}
      <motion.header
        className={styles.header}
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <button className={styles.iconBtn} onClick={onBack} aria-label="Volver al menú">
          ←
        </button>

        <div className={styles.headerCenter}>
          <span className={styles.levelLabel}>Nivel {level.id}</span>
          <span className={styles.levelTitle}>{level.title}</span>
        </div>

        <div className={styles.timer} aria-live="polite" aria-label={`Tiempo: ${formatTime(elapsedTime)}`}>
          {formatTime(elapsedTime)}
        </div>
      </motion.header>

      {/* Board area */}
      <main className={styles.main}>
        <GameBoard
          pieces={pieces}
          groups={groups}
          selectedPieceId={selectedPieceId}
          imageUrl={level.imageUrl}
          gridSize={level.gridSize}
          onPieceClick={handlePieceClick}
        />
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.moveCounter}>
          <span className={styles.moveCount}>{moves}</span>
          <span className={styles.moveLabel}>movimientos</span>
        </div>

        <button className={styles.resetBtn} onClick={resetLevel}>
          Reiniciar
        </button>
      </footer>

      <VictoryModal
        isOpen={isComplete}
        moves={moves}
        timeMs={elapsedTime}
        levelTitle={level.title}
        onNextLevel={() => onNextLevel(level.id + 1)}
        onRetry={resetLevel}
      />
    </div>
  );
}
