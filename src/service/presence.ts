import { updatePlayerPresenceInStore } from '../repository/firebase';
import { Player } from '../types/player';
import { toDate } from '../utils/toDate';

/** How often an open session refreshes its own participant entry. */
export const presenceHeartbeatMs = 30000;

/**
 * How long an entry stays active without a refresh. Generous on purpose:
 * browsers throttle timers in background tabs, and a participant reading the
 * story in another window is still taking part.
 */
export const presenceTimeoutMs = 120000;

export const getLastSeenAt = (player: Player): Date | undefined => toDate(player.lastSeenAt);

/**
 * Whether a participant is currently taking part.
 *
 * A player document outlives the browser that created it, so entries of closed
 * browsers keep showing up in the session. Only a recent refresh proves that
 * somebody is still there.
 *
 * The own entry always counts as active: this browser is rendering the session
 * right now, which is better evidence than any stored timestamp.
 */
export const isPlayerActive = (
  player: Player,
  nowMs: number,
  currentPlayerId?: string,
): boolean => {
  if (player.id === currentPlayerId) {
    return true;
  }

  const lastSeenAt = getLastSeenAt(player);
  if (!lastSeenAt) {
    return false;
  }
  return nowMs - lastSeenAt.getTime() < presenceTimeoutMs;
};

export const getActivePlayerIds = (
  players: Player[],
  nowMs: number,
  currentPlayerId?: string,
): Set<string> =>
  new Set(
    players
      .filter((player) => isPlayerActive(player, nowMs, currentPlayerId))
      .map((player) => player.id),
  );

/**
 * Refreshes the own participant entry. Failures are ignored on purpose: a
 * heartbeat that misses is caught by the next one, and a removed participant
 * is navigated out of the session anyway.
 */
export const updatePresence = async (gameId: string, playerId: string) => {
  try {
    await updatePlayerPresenceInStore(gameId, playerId);
  } catch (error) {
    console.debug('Failed to refresh presence', error);
  }
};
