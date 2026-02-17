import { motion } from 'framer-motion';
import type { GlobalStats } from '../types';
import { formatTotalTime } from '../utils/globalStats';
import styles from './StatsBar.module.css';

interface Props {
  stats: GlobalStats;
}

export function StatsBar({ stats }: Props) {
  if (stats.totalCompleted === 0) return null;

  return (
    <div className={styles.bar}>
      <motion.div className={styles.item} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <span className={styles.icon}>✅</span>
        <span className={styles.value}>{stats.totalCompleted}</span>
        <span className={styles.label}>completados</span>
      </motion.div>
      <div className={styles.divider} />
      <motion.div className={styles.item} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <span className={styles.icon}>👣</span>
        <span className={styles.value}>{stats.totalMoves}</span>
        <span className={styles.label}>movimientos</span>
      </motion.div>
      <div className={styles.divider} />
      <motion.div className={styles.item} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <span className={styles.icon}>⏱</span>
        <span className={styles.value}>{formatTotalTime(stats.totalTimeMs)}</span>
        <span className={styles.label}>jugados</span>
      </motion.div>
      <div className={styles.divider} />
      <motion.div className={styles.item} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <span className={styles.icon}>🔥</span>
        <span className={styles.value}>{stats.currentStreak}</span>
        <span className={styles.label}>racha</span>
      </motion.div>
    </div>
  );
}
