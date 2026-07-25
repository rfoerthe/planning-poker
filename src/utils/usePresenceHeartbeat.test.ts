import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { presenceHeartbeatMs, updatePresence } from '../service/presence';
import { usePresenceHeartbeat } from './usePresenceHeartbeat';

vi.mock('../service/presence', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../service/presence')>();
  return { ...actual, updatePresence: vi.fn() };
});

describe('usePresenceHeartbeat hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should beat immediately and then on the interval', () => {
    renderHook(() => usePresenceHeartbeat('game-1', 'a1'));

    expect(updatePresence).toHaveBeenCalledTimes(1);
    expect(updatePresence).toHaveBeenCalledWith('game-1', 'a1');

    act(() => {
      vi.advanceTimersByTime(presenceHeartbeatMs * 2);
    });

    expect(updatePresence).toHaveBeenCalledTimes(3);
  });

  it('should beat again when the tab becomes visible', () => {
    renderHook(() => usePresenceHeartbeat('game-1', 'a1'));

    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // jsdom reports 'visible' by default.
    expect(updatePresence).toHaveBeenCalledTimes(2);
  });

  it('should do nothing without a player', () => {
    renderHook(() => usePresenceHeartbeat('game-1', undefined));

    act(() => {
      vi.advanceTimersByTime(presenceHeartbeatMs * 3);
    });

    expect(updatePresence).not.toHaveBeenCalled();
  });

  it('should stop beating after unmount', () => {
    const { unmount } = renderHook(() => usePresenceHeartbeat('game-1', 'a1'));

    unmount();
    act(() => {
      vi.advanceTimersByTime(presenceHeartbeatMs * 3);
    });

    expect(updatePresence).toHaveBeenCalledTimes(1);
  });
});
