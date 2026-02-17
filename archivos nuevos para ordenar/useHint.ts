import { useState, useCallback, useRef } from 'react';
import type { PuzzlePiece } from '../types';

const HINT_DURATION_MS = 1500;
const HINT_COOLDOWN_MS = 3000;

export interface UseHintReturn {
  hintPieceId: number | null;
  triggerHint: () => void;
  isOnCooldown: boolean;
}

/**
 * Selects a random incorrect piece and highlights it briefly.
 * Has a cooldown to prevent spamming.
 */
export function useHint(pieces: PuzzlePiece[]): UseHintReturn {
  const [hintPieceId, setHintPieceId] = useState<number | null>(null);
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerHint = useCallback(() => {
    if (isOnCooldown) return;

    const incorrectPieces = pieces.filter(
      (p) => p.currentPosition !== p.correctPosition
    );
    if (incorrectPieces.length === 0) return;

    // Pick a random incorrect piece
    const target = incorrectPieces[Math.floor(Math.random() * incorrectPieces.length)];
    setHintPieceId(target.id);
    setIsOnCooldown(true);

    // Clear hint after duration
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setHintPieceId(null);
      // Release cooldown after a bit more
      setTimeout(() => setIsOnCooldown(false), HINT_COOLDOWN_MS - HINT_DURATION_MS);
    }, HINT_DURATION_MS);
  }, [pieces, isOnCooldown]);

  return { hintPieceId, triggerHint, isOnCooldown };
}
