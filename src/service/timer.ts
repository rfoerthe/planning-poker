import { Game } from '../types/game';
import { Player } from '../types/player';
import { Status } from '../types/status';
import { toDate } from '../utils/toDate';

/** Durations a moderator can pick for a round, in seconds. */
export const timerDurationsInSeconds = [30, 60, 90, 120, 180, 300];

/** Below this many seconds the prominent countdown takes over. */
export const countdownThresholdSeconds = 10;

export const getTimerEndsAt = (game: Game): Date | undefined => toDate(game.timerEndsAt);

/** Remaining whole seconds, counting up to the next full second and never below zero. */
export const getRemainingSeconds = (remainingMs: number | undefined): number | undefined =>
  remainingMs === undefined ? undefined : Math.max(0, Math.ceil(remainingMs / 1000));

export const formatClock = (totalSeconds: number): string => {
  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/** Distance between two participants in the takeover order. */
export const timerTakeoverStepMs = 750;
/** Upper bound, so an expired timer is always resolved within a few seconds. */
export const maxTimerTakeoverDelayMs = 4000;

/**
 * Participants who voted in the current round come first: their browser
 * provably still talks to Firestore. The rest follow by player ID, which is a
 * ULID and therefore orders them by the time they joined.
 */
const compareTakeoverCandidates = (a: Player, b: Player): number => {
  const aHasVoted = a.status === Status.Finished ? 0 : 1;
  const bHasVoted = b.status === Status.Finished ? 0 : 1;

  if (aHasVoted !== bHasVoted) {
    return aHasVoted - bHasVoted;
  }
  return a.id.localeCompare(b.id);
};

/**
 * How long this browser waits before acting on an expired timer.
 *
 * Every browser sees the timer run out, but only one write is needed, so the
 * participants act one after another instead of all at once. The first one
 * reveals the round; the resulting status change reaches everybody else before
 * their own turn and cancels it.
 *
 * The staggering is what makes the reveal survive absent participants. A player
 * document stays in Firestore after its browser is gone, so a fixed choice
 * would hand the reveal to a participant who can no longer perform it.
 */
export const getTimerTakeoverDelayMs = (players: Player[], currentPlayerId: string): number => {
  const rank = [...players]
    .sort(compareTakeoverCandidates)
    .findIndex((player) => player.id === currentPlayerId);

  if (rank < 0) {
    return maxTimerTakeoverDelayMs;
  }
  return Math.min(rank * timerTakeoverStepMs, maxTimerTakeoverDelayMs);
};
