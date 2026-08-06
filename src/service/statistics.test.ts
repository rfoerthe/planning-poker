import {
  ConsensusStatus,
  formatNumber,
  getMedian,
  getNearestCard,
  getNumericSummary,
  isNumericGameType,
} from './statistics';
import {
  fibonacciCards,
  getCustomCards,
  shortFibonacciCards,
} from '../components/Players/CardPicker/CardConfigs';
import { Game, GameType } from '../types/game';
import { Player } from '../types/player';
import { Status } from '../types/status';

describe('statistics service', () => {
  const buildGame = (overrides: Partial<Game> = {}): Game => ({
    id: 'game-1',
    name: 'Refinement',
    gameStatus: Status.Finished,
    gameType: GameType.Fibonacci,
    cards: fibonacciCards,
    createdBy: 'Jack',
    createdById: 'jack-id',
    createdAt: new Date(),
    ...overrides,
  });

  const buildPlayer = (id: string, value: number, name = id): Player => ({
    id,
    name,
    status: Status.Finished,
    value,
  });

  describe('numeric game types', () => {
    it('should treat fibonacci, custom and the default deck as numeric', () => {
      expect(isNumericGameType(GameType.Fibonacci)).toBe(true);
      expect(isNumericGameType(GameType.ShortFibonacci)).toBe(true);
      expect(isNumericGameType(GameType.Custom)).toBe(true);
      expect(isNumericGameType(undefined)).toBe(true);
    });

    it('should treat t-shirt decks as non numeric', () => {
      expect(isNumericGameType(GameType.TShirt)).toBe(false);
    });

    it('should evaluate a custom deck of whole numbers like any numeric deck', () => {
      const game = buildGame({ gameType: GameType.Custom, cards: getCustomCards(['1', '5', '20']) });
      const players = [buildPlayer('a', 1), buildPlayer('b', 5), buildPlayer('c', 20)];

      const summary = getNumericSummary(game, players);

      expect(summary?.median).toBe(5);
      expect(summary?.recommendedCard.displayValue).toBe('5');
    });

    it('should not evaluate a legacy custom deck whose labels are not its values', () => {
      // Decks from before the whole-number restriction stored the input
      // position as the value, with a free-text label on top.
      const legacyCards = [
        { value: 0, displayValue: 'XS', color: 'red' },
        { value: 1, displayValue: 'M', color: 'blue' },
        { value: 2, displayValue: 'XL', color: 'green' },
      ];
      const game = buildGame({ gameType: GameType.Custom, cards: legacyCards });
      const players = [buildPlayer('a', 0), buildPlayer('b', 2)];

      expect(getNumericSummary(game, players)).toBeUndefined();
    });
  });

  describe('helpers', () => {
    it('should calculate the median for odd and even vote counts', () => {
      expect(getMedian([1, 3, 8])).toEqual(3);
      expect(getMedian([3, 5])).toEqual(4);
    });

    it('should find the card closest to a value', () => {
      expect(getNearestCard(shortFibonacciCards.slice(0, 9), 6.6).displayValue).toEqual('8');
      expect(getNearestCard(shortFibonacciCards.slice(0, 9), 2.4).displayValue).toEqual('2');
    });

    it('should resolve a tie towards the higher card', () => {
      expect(getNearestCard(shortFibonacciCards.slice(0, 9), 4).displayValue).toEqual('5');
    });

    it('should format integers without and other values with one decimal', () => {
      expect(formatNumber(8)).toEqual('8');
      expect(formatNumber(8.66)).toEqual('8,7');
    });
  });

  describe('numeric summary', () => {
    it('should not summarize before the votes are revealed', () => {
      const game = buildGame({ gameStatus: Status.InProgress });
      const players = [buildPlayer('a', 3), buildPlayer('b', 5)];

      expect(getNumericSummary(game, players)).toBeUndefined();
    });

    it('should not summarize a t-shirt game', () => {
      const game = buildGame({ gameType: GameType.TShirt, cards: [] });
      const players = [buildPlayer('a', 30), buildPlayer('b', 40)];

      expect(getNumericSummary(game, players)).toBeUndefined();
    });

    it('should not summarize when nobody submitted an estimate', () => {
      const game = buildGame();
      const players = [
        buildPlayer('a', -1),
        { ...buildPlayer('b', 5), status: Status.NotStarted },
      ];

      expect(getNumericSummary(game, players)).toBeUndefined();
    });

    it('should calculate average, median, range and the nearest card', () => {
      const game = buildGame();
      const players = [buildPlayer('a', 5), buildPlayer('b', 8), buildPlayer('c', 13)];

      const summary = getNumericSummary(game, players);

      expect(summary?.average).toBeCloseTo(8.666, 2);
      expect(summary?.median).toEqual(8);
      expect(summary?.lowest.displayValue).toEqual('5');
      expect(summary?.highest.displayValue).toEqual('13');
      expect(summary?.recommendedCard.displayValue).toEqual('8');
      expect(summary?.voteCount).toEqual(3);
    });

    it('should ignore votes without an estimate but count them as abstentions', () => {
      const game = buildGame();
      const players = [
        buildPlayer('a', 3),
        buildPlayer('b', 5),
        buildPlayer('c', -1),
        buildPlayer('d', -2),
        { ...buildPlayer('e', 89), status: Status.NotStarted },
      ];

      const summary = getNumericSummary(game, players);

      expect(summary?.voteCount).toEqual(2);
      expect(summary?.abstentionCount).toEqual(2);
      expect(summary?.average).toEqual(4);
    });

    it('should build a distribution ordered by card value', () => {
      const game = buildGame();
      const players = [
        buildPlayer('a', 5),
        buildPlayer('b', 5),
        buildPlayer('c', 3),
        buildPlayer('d', 13),
      ];

      const summary = getNumericSummary(game, players);

      expect(summary?.distribution).toEqual([
        expect.objectContaining({ displayValue: '3', count: 1, share: 0.5 }),
        expect.objectContaining({ displayValue: '5', count: 2, share: 1 }),
        expect.objectContaining({ displayValue: '13', count: 1, share: 0.5 }),
      ]);
    });

    it('should report consensus for neighbouring cards', () => {
      const game = buildGame();
      const players = [buildPlayer('a', 5), buildPlayer('b', 8), buildPlayer('c', 5)];

      const summary = getNumericSummary(game, players);

      expect(summary?.consensus.status).toEqual(ConsensusStatus.Consensus);
      expect(summary?.consensus.rankSpread).toEqual(1);
    });

    it('should report a moderate spread across two card positions', () => {
      const game = buildGame();
      const players = [buildPlayer('a', 3), buildPlayer('b', 5), buildPlayer('c', 8)];

      const summary = getNumericSummary(game, players);

      expect(summary?.consensus.status).toEqual(ConsensusStatus.ModerateSpread);
      expect(summary?.consensus.rankSpread).toEqual(2);
    });

    it('should report a critical spread and the ratio between lowest and highest vote', () => {
      const game = buildGame();
      const players = [buildPlayer('a', 2), buildPlayer('b', 5), buildPlayer('c', 34)];

      const summary = getNumericSummary(game, players);

      expect(summary?.consensus.status).toEqual(ConsensusStatus.CriticalSpread);
      expect(summary?.consensus.spreadRatio).toEqual(17);
    });

    it('should omit the ratio when the lowest vote is zero', () => {
      const game = buildGame();
      const players = [buildPlayer('a', 0), buildPlayer('b', 1), buildPlayer('c', 21)];

      const summary = getNumericSummary(game, players);

      expect(summary?.consensus.spreadRatio).toBeUndefined();
    });

    it('should mark votes that are far away from the median card', () => {
      const game = buildGame();
      const players = [
        buildPlayer('a', 5, 'Anna'),
        buildPlayer('b', 5, 'Ben'),
        buildPlayer('c', 8, 'Cleo'),
        buildPlayer('d', 55, 'Dave'),
      ];

      const summary = getNumericSummary(game, players);

      expect(summary?.outliers.map((outlier) => outlier.playerName)).toEqual(['Dave']);
    });

    it('should not mark outliers when fewer than three players voted', () => {
      const game = buildGame();
      const players = [buildPlayer('a', 1), buildPlayer('b', 89)];

      const summary = getNumericSummary(game, players);

      expect(summary?.outliers).toEqual([]);
    });

    it('should fall back to the deck of the game type when no cards are stored', () => {
      const game = buildGame({ cards: [], gameType: GameType.ShortFibonacci });
      const players = [buildPlayer('a', 21), buildPlayer('b', 40)];

      const summary = getNumericSummary(game, players);

      expect(summary?.highest.displayValue).toEqual('40');
      expect(summary?.average).toEqual(30.5);
    });
  });
});
