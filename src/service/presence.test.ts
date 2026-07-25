import { vi } from 'vitest';
import {
  getActivePlayerIds,
  getLastSeenAt,
  isPlayerActive,
  presenceTimeoutMs,
  updatePresence,
} from './presence';
import * as fb from '../repository/firebase';
import { Player } from '../types/player';
import { Status } from '../types/status';

vi.mock('../repository/firebase', () => ({
  updatePlayerPresenceInStore: vi.fn(),
}));

describe('presence service', () => {
  const nowMs = new Date('2026-07-25T10:00:00.000Z').getTime();

  const buildPlayer = (id: string, secondsAgo?: number): Player => ({
    id,
    name: id,
    status: Status.NotStarted,
    lastSeenAt: secondsAgo === undefined ? undefined : new Date(nowMs - secondsAgo * 1000),
  });

  describe('activity', () => {
    it('should count a recently seen participant as active', () => {
      expect(isPlayerActive(buildPlayer('a1', 10), nowMs)).toBe(true);
    });

    it('should drop a participant that stopped refreshing', () => {
      expect(isPlayerActive(buildPlayer('a1', presenceTimeoutMs / 1000 + 1), nowMs)).toBe(false);
    });

    it('should treat a participant without any timestamp as inactive', () => {
      // Entries created before presence tracking existed, and closed browsers.
      expect(isPlayerActive(buildPlayer('a1'), nowMs)).toBe(false);
    });

    it('should always count the own entry as active', () => {
      expect(isPlayerActive(buildPlayer('a1'), nowMs, 'a1')).toBe(true);
      expect(isPlayerActive(buildPlayer('a1', 9999), nowMs, 'a1')).toBe(true);
    });

    it('should read a firestore timestamp', () => {
      const lastSeenAt = new Date(nowMs);
      const player = {
        ...buildPlayer('a1'),
        lastSeenAt: { toDate: () => lastSeenAt } as unknown as Date,
      };

      expect(getLastSeenAt(player)).toEqual(lastSeenAt);
      expect(isPlayerActive(player, nowMs)).toBe(true);
    });
  });

  describe('active players', () => {
    it('should separate present participants from leftovers', () => {
      const players = [
        buildPlayer('ghost'),
        buildPlayer('left', 600),
        buildPlayer('watching', 20),
        buildPlayer('me'),
      ];

      const active = getActivePlayerIds(players, nowMs, 'me');

      expect([...active].sort()).toEqual(['me', 'watching']);
    });

    it('should return an empty set without players', () => {
      expect(getActivePlayerIds([], nowMs, 'me').size).toEqual(0);
    });
  });

  describe('heartbeat', () => {
    it('should refresh the own entry', async () => {
      const spy = vi.spyOn(fb, 'updatePlayerPresenceInStore');

      await updatePresence('game-1', 'a1');

      expect(spy).toHaveBeenCalledWith('game-1', 'a1');
    });

    it('should swallow a failed refresh', async () => {
      vi.spyOn(fb, 'updatePlayerPresenceInStore').mockRejectedValueOnce(new Error('offline'));

      await expect(updatePresence('game-1', 'a1')).resolves.toBeUndefined();
    });
  });
});
