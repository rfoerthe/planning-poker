import { useEffect, useState } from 'react';

const defaultTickMs = 250;

/**
 * Milliseconds left until `endsAt`, or `undefined` when no timer is running.
 * Ticks faster than once per second so the visible countdown does not drift.
 */
export const useCountdown = (endsAt: Date | undefined, tickMs = defaultTickMs) => {
  const endsAtTime = endsAt?.getTime();
  const [remainingMs, setRemainingMs] = useState<number | undefined>(() =>
    endsAtTime === undefined ? undefined : Math.max(0, endsAtTime - Date.now()),
  );

  useEffect(() => {
    if (endsAtTime === undefined) {
      setRemainingMs(undefined);
      return;
    }

    const updateRemaining = () => setRemainingMs(Math.max(0, endsAtTime - Date.now()));

    updateRemaining();
    const intervalId = setInterval(updateRemaining, tickMs);

    return () => clearInterval(intervalId);
  }, [endsAtTime, tickMs]);

  return remainingMs;
};
