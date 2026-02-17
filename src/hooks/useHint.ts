import { useCallback, useEffect, useRef, useState } from 'react';
import type { PuzzlePiece } from '../types';

const HINT_DURATION_MS = 1500;
const HINT_COOLDOWN_MS = 3000;

export interface UseHintReturn {
  hintPieceId: number | null;
  triggerHint: () => void;
  isOnCooldown: boolean;
}

export function useHint(pieces: PuzzlePiece[]): UseHintReturn {
  const [hintPieceId, setHintPieceId] = useState<number | null>(null);
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const clearHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (clearHintTimerRef.current) {
      clearTimeout(clearHintTimerRef.current);
      clearHintTimerRef.current = null;
    }
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }
  }, []);

  const triggerHint = useCallback(() => {
    if (isOnCooldown) return;

    const incorrectPieces = pieces.filter((p) => p.currentPosition !== p.correctPosition);
    if (incorrectPieces.length === 0) return;

    const target = incorrectPieces[Math.floor(Math.random() * incorrectPieces.length)];

    clearTimers();
    setHintPieceId(target.id);
    setIsOnCooldown(true);

    clearHintTimerRef.current = setTimeout(() => {
      setHintPieceId(null);
    }, HINT_DURATION_MS);

    cooldownTimerRef.current = setTimeout(() => {
      setIsOnCooldown(false);
    }, HINT_COOLDOWN_MS);
  }, [clearTimers, isOnCooldown, pieces]);

  useEffect(() => {
    if (pieces.every((p) => p.currentPosition === p.correctPosition)) {
      setHintPieceId(null);
      setIsOnCooldown(false);
      clearTimers();
    }
  }, [clearTimers, pieces]);

  useEffect(() => clearTimers, [clearTimers]);

  return { hintPieceId, triggerHint, isOnCooldown };
}
