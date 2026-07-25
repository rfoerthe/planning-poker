import {
  countdownThresholdSeconds,
  formatClock,
  getRemainingSeconds,
  getTimerEndsAt,
  getTimerTakeoverDelayMs,
  timerDurationsInSeconds,
} from './timer';
import { Game, GameType } from '../types/game';
import { Player } from '../types/player';
import { Status } from '../types/status';

describe('timer service', () => {
  const buildGame = (overrides: Partial<Game> = {}): Game => ({
    id: 'game-1',
    name: 'Refinement',
    gameStatus: Status.Started,
    gameType: GameType.Fibonacci,
    cards: [],
    createdBy: 'Jack',
    createdById: 'jack-id',
    createdAt: new Date(),
    ...overrides,
  });

  const buildPlayer = (id: string): Player => ({
    id,
    name: id,
    status: Status.NotStarted,
  });

  it('should offer the agreed round durations', () => {
    expect(timerDurationsInSeconds).toEqual([30, 60, 90, 120, 180, 300]);
    expect(countdownThresholdSeconds).toEqual(10);
  });

  describe('clock format', () => {
    it('should format the offered durations', () => {
      expect(timerDurationsInSeconds.map(formatClock)).toEqual([
        '0:30',
        '1:00',
        '1:30',
        '2:00',
        '3:00',
        '5:00',
      ]);
    });

    it('should pad seconds and never go below zero', () => {
      expect(formatClock(65)).toEqual('1:05');
      expect(formatClock(-5)).toEqual('0:00');
    });
  });

  describe('timer end', () => {
    it('should read the timer end from a game', () => {
      const endsAt = new Date('2026-07-25T10:00:00.000Z');

      expect(getTimerEndsAt(buildGame({ timerEndsAt: endsAt }))).toEqual(endsAt);
      expect(getTimerEndsAt(buildGame({ timerEndsAt: null }))).toBeUndefined();
      expect(getTimerEndsAt(buildGame())).toBeUndefined();
    });
  });

  describe('remaining seconds', () => {
    it('should round up to the next full second', () => {
      expect(getRemainingSeconds(9400)).toEqual(10);
      expect(getRemainingSeconds(1)).toEqual(1);
    });

    it('should never report less than zero', () => {
      expect(getRemainingSeconds(-500)).toEqual(0);
    });

    it('should stay undefined without a running timer', () => {
      expect(getRemainingSeconds(undefined)).toBeUndefined();
    });
  });

  describe('takeover delay', () => {
    const buildVoter = (id: string): Player => ({
      id,
      name: id,
      status: Status.Finished,
      value: 5,
    });

    it('should give every browser its own turn', () => {
      const players = [buildPlayer('01H3'), buildPlayer('01H1'), buildPlayer('01H2')];

      expect(getTimerTakeoverDelayMs(players, '01H1')).toEqual(0);
      expect(getTimerTakeoverDelayMs(players, '01H2')).toEqual(750);
      expect(getTimerTakeoverDelayMs(players, '01H3')).toEqual(1500);
    });

    it('should derive the same order regardless of the incoming player order', () => {
      const players = [buildPlayer('01H3'), buildPlayer('01H1'), buildPlayer('01H2')];

      expect(getTimerTakeoverDelayMs([...players].reverse(), '01H2')).toEqual(750);
    });

    it('should let participants who voted act before idle ones', () => {
      // The reported failure: older participants are still listed but their
      // browsers are gone, so they must not block the reveal.
      const players = [buildPlayer('01H1'), buildPlayer('01H2'), buildVoter('01H9')];

      expect(getTimerTakeoverDelayMs(players, '01H9')).toEqual(0);
      expect(getTimerTakeoverDelayMs(players, '01H1')).toEqual(750);
    });

    it('should order several voters among themselves', () => {
      const players = [buildVoter('01H5'), buildPlayer('01H1'), buildVoter('01H3')];

      expect(getTimerTakeoverDelayMs(players, '01H3')).toEqual(0);
      expect(getTimerTakeoverDelayMs(players, '01H5')).toEqual(750);
      expect(getTimerTakeoverDelayMs(players, '01H1')).toEqual(1500);
    });

    it('should cap the delay so an expired timer is always resolved', () => {
      const players = Array.from({ length: 20 }, (_, index) =>
        buildPlayer(`01H${index.toString().padStart(2, '0')}`),
      );

      expect(getTimerTakeoverDelayMs(players, '01H19')).toEqual(4000);
    });

    it('should act last when the player is not part of the game', () => {
      expect(getTimerTakeoverDelayMs([buildPlayer('01H1')], 'unknown')).toEqual(4000);
      expect(getTimerTakeoverDelayMs([], 'unknown')).toEqual(4000);
    });
  });
});
