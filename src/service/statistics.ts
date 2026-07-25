import { CardConfig, getCards } from '../components/Players/CardPicker/CardConfigs';
import { Game, GameType } from '../types/game';
import { Player } from '../types/player';
import { Status } from '../types/status';

export enum ConsensusStatus {
  Consensus = 'consensus',
  ModerateSpread = 'moderate-spread',
  CriticalSpread = 'critical-spread',
}

export interface ConsensusResult {
  status: ConsensusStatus;
  code: string;
  message: string;
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
  average: number;
  median: number;
  lowest: NumericVote;
  highest: NumericVote;
  recommendedCard: CardConfig;
  voteCount: number;
  abstentionCount: number;
  distribution: DistributionEntry[];
  outliers: NumericVote[];
  consensus: ConsensusResult;
}

// A vote is an outlier when its card is at least this many positions away from the median card.
const outlierRankDistance = 2;
// Below this number of votes an outlier is not meaningful.
const minimumVotesForOutliers = 3;

export const isNumericGameType = (gameType: GameType | undefined): boolean =>
  gameType !== GameType.TShirt &&
  gameType !== GameType.TShirtAndNumber &&
  gameType !== GameType.Custom;

export const formatNumber = (value: number): string => {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
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

export const getMedian = (sortedValues: number[]): number => {
  const lowerMiddle = sortedValues[Math.floor((sortedValues.length - 1) / 2)];
  const upperMiddle = sortedValues[Math.ceil((sortedValues.length - 1) / 2)];

  return (lowerMiddle + upperMiddle) / 2;
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

  if (rankSpread >= 3 || (votes.length > 2 && standardDeviation > 1.5)) {
    return {
      status: ConsensusStatus.CriticalSpread,
      code: 'CRITICAL SPREAD',
      message: 'Discussion required!',
      rankSpread,
      standardDeviation,
      spreadRatio,
    };
  }

  if (rankSpread === 2) {
    return {
      status: ConsensusStatus.ModerateSpread,
      code: 'MODERATE SPREAD',
      message: 'Short clarification recommended.',
      rankSpread,
      standardDeviation,
      spreadRatio,
    };
  }

  return {
    status: ConsensusStatus.Consensus,
    code: 'CONSENSUS',
    message: 'Estimate plausible.',
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

  if (!votes.length || !numericCards.length) {
    return undefined;
  }

  const values = votes.map((vote) => vote.value);
  const average = values.reduce((sum, value) => sum + value, 0) / votes.length;

  return {
    average,
    median: getMedian(values),
    lowest: votes[0],
    highest: votes[votes.length - 1],
    recommendedCard: getNearestCard(numericCards, average),
    voteCount: votes.length,
    abstentionCount: getAbstentionCount(players),
    distribution: getDistribution(votes, numericCards),
    outliers: getOutliers(votes),
    consensus: getConsensus(votes),
  };
};
