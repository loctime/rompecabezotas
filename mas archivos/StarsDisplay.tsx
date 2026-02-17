import { memo } from 'react';
import { motion } from 'framer-motion';
import styles from './StarsDisplay.module.css';

interface Props {
  stars: number;        // 0–3
  maxStars?: number;    // default 3
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;    // stagger animation on mount
}

export const StarsDisplay = memo(function StarsDisplay({
  stars,
  maxStars = 3,
  size = 'md',
  animate = false,
}: Props) {
  return (
    <div className={`${styles.row} ${styles[size]}`} aria-label={`${stars} de ${maxStars} estrellas`}>
      {Array.from({ length: maxStars }, (_, i) => {
        const filled = i < stars;
        const star = (
          <span
            key={i}
            className={`${styles.star} ${filled ? styles.filled : styles.empty}`}
            aria-hidden
          >
            ★
          </span>
        );

        if (!animate) return star;

        return (
          <motion.span
            key={i}
            className={`${styles.star} ${filled ? styles.filled : styles.empty}`}
            aria-hidden
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.3 + i * 0.15,
              type: 'spring',
              stiffness: 400,
              damping: 18,
            }}
          >
            ★
          </motion.span>
        );
      })}
    </div>
  );
});
