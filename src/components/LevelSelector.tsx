import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Level } from '../types';
import styles from './LevelSelector.module.css';

interface Props {
  levels: Level[];
  onSelectLevel: (level: Level) => void;
}

const DIFFICULTY_LABELS: Record<number, string> = {
  3: 'Fácil',
  4: 'Medio',
  5: 'Difícil',
};

export function LevelSelector({ levels, onSelectLevel }: Props) {
  // Find first unlocked+incomplete level
  const currentLevel = useMemo(
    () => levels.find((l) => l.unlocked && !l.completed) ?? levels[0],
    [levels]
  );

  // Group levels by gridSize for visual separation
  const groups = useMemo(() => {
    const map = new Map<number, Level[]>();
    for (const lvl of levels) {
      if (!map.has(lvl.gridSize)) map.set(lvl.gridSize, []);
      map.get(lvl.gridSize)!.push(lvl);
    }
    return [...map.entries()].sort(([a], [b]) => a - b);
  }, [levels]);

  return (
    <div className={styles.screen}>
      {/* Logo */}
      <motion.header
        className={styles.logoArea}
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={styles.logo}>Jigsolitaire</h1>
        <p className={styles.tagline}>Completa el rompecabezas</p>
      </motion.header>

      {/* Play current level CTA */}
      {currentLevel && (
        <motion.div
          className={styles.ctaWrapper}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 22 }}
        >
          <button
            className={styles.ctaButton}
            onClick={() => onSelectLevel(currentLevel)}
          >
            <span className={styles.ctaLabel}>Jugar</span>
            <span className={styles.ctaLevel}>Nivel {currentLevel.id} — {currentLevel.title}</span>
          </button>
        </motion.div>
      )}

      {/* Level grid grouped by difficulty */}
      <div className={styles.content}>
        {groups.map(([gridSize, groupLevels]) => (
          <section key={gridSize} className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {DIFFICULTY_LABELS[gridSize] ?? `${gridSize}×${gridSize}`}
              <span className={styles.sectionGrid}>{gridSize}×{gridSize}</span>
            </h2>

            <div className={styles.grid}>
              {groupLevels.map((level, i) => (
                <motion.button
                  key={level.id}
                  className={[
                    styles.levelCard,
                    !level.unlocked && styles.locked,
                    level.completed && styles.completed,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={level.unlocked ? { scale: 1.06 } : {}}
                  whileTap={level.unlocked ? { scale: 0.96 } : {}}
                  onClick={() => level.unlocked && onSelectLevel(level)}
                  disabled={!level.unlocked}
                  aria-label={`Nivel ${level.id}: ${level.title}${level.completed ? ' (completado)' : ''}${!level.unlocked ? ' (bloqueado)' : ''}`}
                >
                  {level.unlocked ? (
                    <>
                      <div
                        className={styles.cardImage}
                        style={{ backgroundImage: `url(${level.imageUrl})` }}
                      />
                      {level.completed && (
                        <div className={styles.completedBadge} aria-hidden>✓</div>
                      )}
                      <div className={styles.cardNumber}>{level.id}</div>
                    </>
                  ) : (
                    <div className={styles.lockIcon} aria-hidden>🔒</div>
                  )}
                </motion.button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
