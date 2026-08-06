import { CardConfig, getCards } from '../components/Players/CardPicker/CardConfigs';
import { Game, GameType } from '../types/game';
import { Player } from '../types/player';
import { Status } from '../types/status';

export enum ConsensusStatus {
  Consensus = 'consensus',
  ModerateSpread = 'moderate-spread',
  CriticalSpread = 'critical-spread',
}

/** Wording for a status lives in the translation bundle, not in the statistics. */
export interface ConsensusResult {
  status: ConsensusStatus;
  rankSpread: number;
  standardDeviation: number;
  spreadRatio?: number;
}

export interface NumericVote {
  playerId: string;
  playerName: string;
  value: number;
  displayValue: string;
  rank: number;
}

export interface DistributionEntry {
  value: number;
  displayValue: string;
  color: string;
  count: number;
  share: number;
}

export interface NumericSummaryResult {
  /** Deck of the round, so explanations can speak in the deck's own terms. */
  gameType: GameType | undefined;
  average: number;
  median: number;
  /** Every counted vote, lowest first. Carries the ranks the spread is built on. */
  votes: NumericVote[];
  lowest: NumericVote;
  highest: NumericVote;
  recommendedCard: CardConfig;
  /** The cards the average falls between, for explaining why one of them won. */
  recommendationCandidates: CardConfig[];
  voteCount: number;
  abstentionCount: number;
  distribution: DistributionEntry[];
  outliers: NumericVote[];
  consensus: ConsensusResult;
}

// A vote is an outlier when its card is at least this many positions away from the median card.
export const outlierRankDistance = 2;
// Below this number of votes an outlier is not meaningful.
export const minimumVotesForOutliers = 3;

/*
 * Thresholds of the consensus verdict. Exported because the panels explain the
 * verdict to the reader, and an explanation that names a different number than
 * the rule would be worse than none at all.
 */
export const criticalRankSpread = 3;
export const moderateRankSpread = 2;
export const criticalStandardDeviation = 1.5;
// Below this, a deviation says more about the number of votes than about agreement.
export const minimumVotesForDeviationRule = 2;

/**
 * Whether the votes are too far apart to accept the round.
 *
 * Either end of the deck being far from the other is enough on its own; the
 * deviation rule additionally catches a field that is spread out without any
 * single vote sitting far out.
 */
export const isCriticalSpread = (
  rankSpread: number,
  standardDeviation: number,
  voteCount: number,
): boolean =>
  rankSpread >= criticalRankSpread ||
  (voteCount > minimumVotesForDeviationRule && standardDeviation > criticalStandardDeviation);

/**
 * Whether the card values of a deck are real estimates that may be averaged.
 *
 * Named decks rather than excluded ones: a session document outlives the code
 * that created it, so a deck this version no longer offers must not be run
 * through the numeric evaluation. An unset type predates the deck choice and
 * has always meant the default numeric deck.
 */
export const isNumericGameType = (gameType: GameType | undefined): boolean =>
  gameType === undefined ||
  gameType === GameType.Fibonacci ||
  gameType === GameType.ShortFibonacci ||
  gameType === GameType.Custom;

/**
 * Whether every estimate card shows the value it carries.
 *
 * Custom decks from before the whole-number restriction stored the position of
 * the input field as the value, with a free-text label on top. Averaging those
 * would average field positions, so such a deck gets no numeric evaluation.
 */
const deckShowsItsValues = (numericCards: CardConfig[]): boolean =>
  numericCards.every((card) => card.displayValue === String(card.value));

/** One decimal at most, with the decimal comma the German UI expects. */
export const formatNumber = (value: number): string => {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1).replace('.', ',');
};

/**
 * Cards of the deck that carry a real estimate, ordered from low to high.
 * The index of a card is its rank and is used for all spread calculations,
 * because the distance between two Fibonacci values grows with their size.
 */
const getNumericCards = (game: Game): CardConfig[] => {
  const cards = game.cards?.length ? game.cards : getCards(game.gameType);

  return cards.filter((card) => card.value >= 0).sort((a, b) => a.value - b.value);
};

const getNumericVotes = (players: Player[], numericCards: CardConfig[]): NumericVote[] => {
  return players
    .flatMap((player): NumericVote[] => {
      if (player.status !== Status.Finished || player.value === undefined || player.value < 0) {
        return [];
      }

      const rank = numericCards.findIndex((card) => card.value === player.value);
      if (rank < 0) {
        return [];
      }

      return [
        {
          playerId: player.id,
          playerName: player.name,
          value: player.value,
          displayValue: numericCards[rank].displayValue,
          rank,
        },
      ];
    })
    .sort((a, b) => a.value - b.value);
};

const getAbstentionCount = (players: Player[]): number => {
  return players.filter(
    (player) =>
      player.status === Status.Finished && player.value !== undefined && player.value < 0,
  ).length;
};

/**
 * Where the middle of a sorted list sits. Both indexes are the same entry for
 * an odd number of votes, and the two entries the middle falls between for an
 * even one. Shared so that an explanation of the median cannot point at a
 * different entry than the calculation used.
 */
export const getMedianIndexes = (length: number): [number, number] => [
  Math.floor((length - 1) / 2),
  Math.ceil((length - 1) / 2),
];

export const getMedian = (sortedValues: number[]): number => {
  const [lowerIndex, upperIndex] = getMedianIndexes(sortedValues.length);

  return (sortedValues[lowerIndex] + sortedValues[upperIndex]) / 2;
};

/**
 * The card closest to the given value. An average like 6.5 has no matching
 * Fibonacci card, so the team needs the card it should actually agree on.
 * Ties resolve to the higher card to avoid systematic under-estimation.
 */
export const getNearestCard = (numericCards: CardConfig[], value: number): CardConfig => {
  return numericCards.reduce((nearest, card) => {
    const cardDistance = Math.abs(card.value - value);
    const nearestDistance = Math.abs(nearest.value - value);

    if (cardDistance < nearestDistance) {
      return card;
    }
    if (cardDistance === nearestDistance && card.value > nearest.value) {
      return card;
    }
    return nearest;
  }, numericCards[0]);
};

/** The cards immediately below and above a value, deduplicated when it hits one exactly. */
const getNearestCandidates = (numericCards: CardConfig[], value: number): CardConfig[] => {
  const below = [...numericCards].reverse().find((card) => card.value <= value);
  const above = numericCards.find((card) => card.value >= value);
  const candidates = [below, above].filter((card): card is CardConfig => card !== undefined);

  return [...new Set(candidates)];
};

const getDistribution = (votes: NumericVote[], numericCards: CardConfig[]): DistributionEntry[] => {
  const counts = new Map<number, number>();
  votes.forEach((vote) => counts.set(vote.value, (counts.get(vote.value) ?? 0) + 1));

  const highestCount = Math.max(...counts.values());

  return numericCards
    .filter((card) => counts.has(card.value))
    .map((card) => {
      const count = counts.get(card.value) as number;

      return {
        value: card.value,
        displayValue: card.displayValue,
        color: card.color,
        count,
        share: count / highestCount,
      };
    });
};

const getOutliers = (votes: NumericVote[]): NumericVote[] => {
  if (votes.length < minimumVotesForOutliers) {
    return [];
  }

  const medianRank = getMedian(votes.map((vote) => vote.rank));

  return votes.filter((vote) => Math.abs(vote.rank - medianRank) >= outlierRankDistance);
};

const getStandardDeviation = (values: number[]): number => {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;

  return Math.sqrt(variance);
};

const getConsensus = (votes: NumericVote[]): ConsensusResult => {
  const ranks = votes.map((vote) => vote.rank);
  const rankSpread = Math.max(...ranks) - Math.min(...ranks);
  const standardDeviation = getStandardDeviation(ranks);
  const lowestValue = votes[0].value;
  const highestValue = votes[votes.length - 1].value;
  const spreadRatio = lowestValue > 0 ? highestValue / lowestValue : undefined;

  if (isCriticalSpread(rankSpread, standardDeviation, votes.length)) {
    return {
      status: ConsensusStatus.CriticalSpread,
      rankSpread,
      standardDeviation,
      spreadRatio,
    };
  }

  if (rankSpread === moderateRankSpread) {
    return {
      status: ConsensusStatus.ModerateSpread,
      rankSpread,
      standardDeviation,
      spreadRatio,
    };
  }

  return {
    status: ConsensusStatus.Consensus,
    rankSpread,
    standardDeviation,
    spreadRatio,
  };
};

/**
 * Statistics for a revealed session with a numeric deck.
 *
 * Returns `undefined` while the session is not revealed, so that no caller can
 * expose vote details before the moderator reveals them.
 */
export const getNumericSummary = (
  game: Game,
  players: Player[],
): NumericSummaryResult | undefined => {
  if (game.gameStatus !== Status.Finished || !isNumericGameType(game.gameType)) {
    return undefined;
  }

  const numericCards = getNumericCards(game);
  const votes = getNumericVotes(players, numericCards);

  if (!votes.length || !numericCards.length || !deckShowsItsValues(numericCards)) {
    return undefined;
  }

  const values = votes.map((vote) => vote.value);
  const average = values.reduce((sum, value) => sum + value, 0) / votes.length;

  return {
    gameType: game.gameType,
    average,
    median: getMedian(values),
    votes,
    lowest: votes[0],
    highest: votes[votes.length - 1],
    recommendedCard: getNearestCard(numericCards, average),
    recommendationCandidates: getNearestCandidates(numericCards, average),
    voteCount: votes.length,
    abstentionCount: getAbstentionCount(players),
    distribution: getDistribution(votes, numericCards),
    outliers: getOutliers(votes),
    consensus: getConsensus(votes),
  };
};
