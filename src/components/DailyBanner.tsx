import { motion } from 'framer-motion';
import type { DailyChallenge, Level } from '../types';
import styles from './DailyBanner.module.css';

interface Props {
  daily: DailyChallenge;
  level: Level | undefined;
  onPlay: () => void;
}

function getTodayLabel(): string {
  return new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function DailyBanner({ daily, level, onPlay }: Props) {
  return (
    <motion.div className={styles.banner} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.left}>
        <span className={styles.icon}>📅</span>
        <div className={styles.info}>
          <span className={styles.label}>Desafío del día</span>
          <span className={styles.date}>{getTodayLabel()}</span>
          {level && <span className={styles.levelName}>{level.title}</span>}
        </div>
      </div>

      <button
        className={`${styles.playBtn} ${daily.completed ? styles.done : ''}`}
        onClick={onPlay}
        disabled={daily.completed}
        aria-label={daily.completed ? 'Desafío completado' : 'Jugar desafío del día'}
      >
        {daily.completed ? '✓ Hecho' : 'Jugar'}
      </button>
    </motion.div>
  );
}
