import { motion } from 'framer-motion';
import type { GlobalStats } from '../types';
import { formatTotalTime } from '../utils/globalStats';
import styles from './StatsBar.module.css';

interface Props {
  stats: GlobalStats;
  totalStarsMax: number; // total possible stars (levels * 3)
}

interface StatItemProps {
  icon: string;
  value: string | number;
  label: string;
  delay: number;
}

function StatItem({ icon, value, label, delay }: StatItemProps) {
  return (
    <motion.div
      className={styles.item}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <span className={styles.icon}>{icon}</span>
      <span className={styles.value}>{value}</span>
      <span className={styles.label}>{label}</span>
    </motion.div>
  );
}

export function StatsBar({ stats, totalStarsMax }: Props) {
  if (stats.totalCompleted === 0) return null; // hide until first completion

  return (
    <div className={styles.bar}>
      <StatItem icon="✅" value={stats.totalCompleted} label="completados" delay={0.1} />
      <div className={styles.divider} />
      <StatItem icon="⭐" value={`${stats.totalStars}/${totalStarsMax}`} label="estrellas" delay={0.18} />
      <div className={styles.divider} />
      <StatItem icon="🔥" value={stats.currentStreak} label="racha días" delay={0.26} />
      <div className={styles.divider} />
      <StatItem icon="⏱" value={formatTotalTime(stats.totalTimeMs)} label="jugados" delay={0.34} />
    </div>
  );
}
