import { useEffect, useState } from 'react';

/**
 * A timestamp that advances on a fixed interval. Needed where the UI depends on
 * elapsed time rather than on incoming data, so that a value which merely grows
 * stale is re-evaluated without any further update from the store.
 */
export const useNow = (intervalMs: number) => {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => setNowMs(Date.now()), intervalMs);

    return () => clearInterval(intervalId);
  }, [intervalMs]);

  return nowMs;
};
