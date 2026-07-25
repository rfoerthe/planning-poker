import { useEffect } from 'react';
import { presenceHeartbeatMs, updatePresence } from '../service/presence';

/**
 * Keeps the own participant entry marked as present while the session is open.
 * Beats once on entering, then on a fixed interval, and once more whenever the
 * tab becomes visible again, because browsers throttle timers in the
 * background and the entry should recover immediately on return.
 */
export const usePresenceHeartbeat = (gameId: string, playerId: string | undefined) => {
  useEffect(() => {
    if (!playerId) {
      return;
    }

    const beat = () => void updatePresence(gameId, playerId);

    beat();
    const intervalId = setInterval(beat, presenceHeartbeatMs);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        beat();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [gameId, playerId]);
};
