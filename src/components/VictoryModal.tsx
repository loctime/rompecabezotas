import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarsDisplay } from './StarsDisplay';
import styles from './VictoryModal.module.css';

interface Props {
  isOpen: boolean;
  moves: number;
  timeMs: number;
  levelTitle: string;
  stars: number;        // stars earned this run (1–3)
  bestMoves?: number;   // previous best (undefined if first completion)
  isNewRecord: boolean;
  isDaily?: boolean;
  onNextLevel: () => void;
  onRetry: () => void;
}

// ── Confetti ───────────────────────────────────────────────────────────────────
const COLORS = ['#FFD700', '#6ec4b8', '#ffffff', '#00BCD4', '#ff6b9d'];
const PIECE_COUNT = 60;

function Confetti() {
  return (
    <div className={styles.confettiContainer} aria-hidden>
      {Array.from({ length: PIECE_COUNT }, (_, i) => (
        <span
          key={i}
          className={styles.confettiPiece}
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 1.5}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
            background: COLORS[Math.floor(Math.random() * COLORS.length)],
            width: `${6 + Math.random() * 6}px`,
            height: `${6 + Math.random() * 6}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

export function VictoryModal({
  isOpen,
  moves,
  timeMs,
  levelTitle,
  stars,
  bestMoves,
  isNewRecord,
  isDaily = false,
  onNextLevel,
  onRetry,
}: Props) {
  const nextBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) nextBtnRef.current?.focus();
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Nivel completado"
        >
          <Confetti />

          <motion.div
            className={styles.card}
            initial={{ scale: 0.5, y: 80 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 80 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          >
            {/* Emoji + badges */}
            <div className={styles.topRow}>
              <motion.div
                className={styles.emoji}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
              >
                {isDaily ? '📅' : '🎉'}
              </motion.div>

              {isNewRecord && (
                <motion.div
                  className={styles.recordBadge}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                >
                  ⚡ Nuevo récord
                </motion.div>
              )}
            </div>

            <h2 className={styles.title}>
              {isDaily ? '¡Desafío Diario!' : '¡Completado!'}
            </h2>
            <p className={styles.subtitle}>{levelTitle}</p>

            {/* Stars */}
            <div className={styles.starsRow}>
              <StarsDisplay stars={stars} size="lg" animate />
            </div>

            {/* Stats */}
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Movimientos</span>
                <span className={styles.statValue}>{moves}</span>
                {bestMoves !== undefined && bestMoves < moves && (
                  <span className={styles.statSub}>Récord: {bestMoves}</span>
                )}
              </div>
              <div className={styles.divider} />
              <div className={styles.stat}>
                <span className={styles.statLabel}>Tiempo</span>
                <span className={styles.statValue}>{formatTime(timeMs)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <button ref={nextBtnRef} className={styles.btnPrimary} onClick={onNextLevel}>
                {isDaily ? 'Ver niveles' : 'Siguiente nivel →'}
              </button>
              <button className={styles.btnSecondary} onClick={onRetry}>
                Reintentar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
