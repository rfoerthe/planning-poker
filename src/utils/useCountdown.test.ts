import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useCountdown } from './useCountdown';

describe('useCountdown hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should report no remaining time without an end date', () => {
    const { result } = renderHook(() => useCountdown(undefined));

    expect(result.current).toBeUndefined();
  });

  it('should count down towards the end date', () => {
    vi.setSystemTime(new Date('2026-07-25T10:00:00.000Z'));
    const endsAt = new Date('2026-07-25T10:00:05.000Z');

    const { result } = renderHook(() => useCountdown(endsAt));

    expect(result.current).toEqual(5000);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current).toEqual(2000);
  });

  it('should stop at zero instead of going negative', () => {
    vi.setSystemTime(new Date('2026-07-25T10:00:00.000Z'));
    const endsAt = new Date('2026-07-25T10:00:01.000Z');

    const { result } = renderHook(() => useCountdown(endsAt));

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current).toEqual(0);
  });

  it('should clear the remaining time when the timer is removed', () => {
    vi.setSystemTime(new Date('2026-07-25T10:00:00.000Z'));
    const endsAt = new Date('2026-07-25T10:00:05.000Z');

    const { result, rerender } = renderHook(({ end }) => useCountdown(end), {
      initialProps: { end: endsAt as Date | undefined },
    });

    expect(result.current).toEqual(5000);

    rerender({ end: undefined });

    expect(result.current).toBeUndefined();
  });
});
