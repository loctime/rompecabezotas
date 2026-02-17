import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Level } from '../types';
import { useGameState } from '../hooks/useGameState';
import { useSound } from '../hooks/useSound';
import { useHint } from '../hooks/useHint';
import { calculateStars } from '../utils/stars';
import { GameBoard } from './GameBoard';
import { VictoryModal } from './VictoryModal';
import styles from './GameScreen.module.css';

interface Props {
  level: Level;
  isDaily?: boolean;
  onBack: () => void;
  onNextLevel: (id: number) => void;
  onLevelComplete: (levelId: number, moves: number, timeMs: number, stars: number, isNewRecord: boolean) => void;
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

export function GameScreen({ level, isDaily = false, onBack, onNextLevel, onLevelComplete }: Props) {
  const { pieces, groups, selectedPieceId, isComplete, moves, elapsedTime, handlePieceClick, handleSwap, resetLevel } = useGameState(level);
  const { play, enabled: soundEnabled, toggle: toggleSound } = useSound();
  const { hintPieceId, triggerHint, dismissHint, isOnCooldown } = useHint(pieces);
  const [completionResult, setCompletionResult] = useState<{ stars: number; isNewRecord: boolean; previousBestMoves?: number } | null>(null);

  const prevGroupCountRef = useRef(groups.length);
  useEffect(() => {
    if (groups.length < prevGroupCountRef.current) play('merge');
    prevGroupCountRef.current = groups.length;
  }, [groups.length, play]);

  const prevSelectedRef = useRef<number | null>(null);
  useEffect(() => {
    if (selectedPieceId !== null && prevSelectedRef.current === null) play('select');
    prevSelectedRef.current = selectedPieceId;
  }, [selectedPieceId, play]);

  const handlePieceClickWithSound = useCallback((pieceId: number) => {
    if (selectedPieceId !== null && selectedPieceId !== pieceId) play('swap');
    handlePieceClick(pieceId);
  }, [selectedPieceId, handlePieceClick, play]);

  const handleSwapWithSound = useCallback((pieceId1: number, pieceId2: number) => {
    play('swap');
    handleSwap(pieceId1, pieceId2);
  }, [handleSwap, play]);

  const completionReportedRef = useRef(false);
  useEffect(() => {
    if (isComplete && !completionReportedRef.current) {
      completionReportedRef.current = true;
      dismissHint();
      const stars = calculateStars(moves, level.gridSize);
      const previousBestMoves = level.bestMoves;
      const isNewRecord = !isDaily && (!level.completed || moves < (level.bestMoves ?? Number.POSITIVE_INFINITY));
      setCompletionResult({ stars, isNewRecord, previousBestMoves });
      play('victory');
      onLevelComplete(level.id, moves, elapsedTime, stars, isNewRecord);
    }

    if (!isComplete) {
      completionReportedRef.current = false;
      setCompletionResult(null);
    }
  }, [isComplete, dismissHint, moves, level, elapsedTime, isDaily, play, onLevelComplete]);

  useEffect(() => {
    dismissHint();
  }, [dismissHint, isDaily, level.id]);

  const handleDragStart = useCallback(() => {
    dismissHint();
  }, [dismissHint]);

  return (
    <div className={styles.screen}>
      <motion.header className={styles.header} initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
        <button className={styles.iconBtn} onClick={onBack} aria-label="Volver al menu">←</button>

        <div className={styles.headerCenter}>
          <span className={styles.levelLabel}>{isDaily ? '📅 Desafío del día' : `Nivel ${level.id}`}</span>
          <span className={styles.levelTitle}>{level.title}</span>
        </div>

        <button className={styles.iconBtn} onClick={toggleSound} aria-label={soundEnabled ? 'Silenciar sonido' : 'Activar sonido'}>
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </motion.header>

      <div className={styles.timerBar}>
        <span className={styles.timerValue} aria-live="polite">⏱ {formatTime(elapsedTime)}</span>
      </div>

      <main className={styles.main}>
        <GameBoard
          pieces={pieces}
          groups={groups}
          selectedPieceId={selectedPieceId}
          hintPieceId={hintPieceId}
          imageUrl={level.imageUrl}
          gridSize={level.gridSize}
          onPieceClick={handlePieceClickWithSound}
          onSwap={handleSwapWithSound}
          onDragStart={handleDragStart}
        />
      </main>

      <footer className={styles.footer}>
        <div className={styles.moveCounter}>
          <span className={styles.moveCount}>{moves}</span>
          <span className={styles.moveLabel}>movimientos</span>
        </div>

        <button className={styles.hintBtn} onClick={triggerHint} disabled={isOnCooldown || isComplete}>💡 Pista</button>
        <button className={styles.resetBtn} onClick={resetLevel}>Reiniciar</button>
      </footer>

      <VictoryModal
        isOpen={isComplete}
        moves={moves}
        timeMs={elapsedTime}
        levelTitle={level.title}
        stars={completionResult?.stars ?? 0}
        bestMoves={completionResult?.previousBestMoves}
        isNewRecord={completionResult?.isNewRecord ?? false}
        isDaily={isDaily}
        onNextLevel={() => onNextLevel(level.id + 1)}
        onRetry={resetLevel}
      />
    </div>
  );
}
