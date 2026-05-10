import { Card, CardContent, Typography } from '@mui/material';
import React from 'react';
import { Game, GameType } from '../../../types/game';
import { Player } from '../../../types/player';
import { Status } from '../../../types/status';
import { getCards } from '../../Players/CardPicker/CardConfigs';
import './TshirtSummary.css';

interface TshirtSummaryProps {
  game: Game;
  players: Player[];
}

interface TshirtEffortRange {
  min: number;
  max: number;
}

interface TshirtVote {
  value: number;
  label: string;
  range: TshirtEffortRange;
  rank: number;
}

interface TshirtSummaryResult {
  medianLabel: string;
  medianRange: string;
  totalMedianValue: string;
  voteCount: number;
  consensus: TshirtConsensusResult;
}

interface TshirtConsensusResult {
  status: TshirtConsensusStatus;
  code: string;
  message: string;
  rankSpread: number;
  standardDeviation: number;
  effortRatio: number;
}

const tshirtEffortRanges: Record<string, TshirtEffortRange> = {
  XXS: { min: 1, max: 5 },
  XS: { min: 5, max: 10 },
  S: { min: 11, max: 20 },
  M: { min: 21, max: 50 },
  L: { min: 51, max: 100 },
  XL: { min: 101, max: 300 },
  XXL: { min: 301, max: 10000 },
};

const tshirtRankMap: Record<string, number> = {
  XXS: 1,
  XS: 2,
  S: 3,
  M: 4,
  L: 5,
  XL: 6,
  XXL: 7,
};

export enum TshirtConsensusStatus {
  Consensus = 'consensus',
  ModerateSpread = 'moderate-spread',
  CriticalSpread = 'critical-spread',
}

export const TshirtSummary: React.FC<TshirtSummaryProps> = ({ game, players }) => {
  const summary = getTshirtSummary(game, players);

  if (game.gameStatus !== Status.Finished || game.gameType !== GameType.TShirt) {
    return null;
  }

  return (
    <Card variant='outlined' className='TshirtSummaryCard' data-testid='tshirt-summary'>
      <CardContent className='TshirtSummaryContent'>
        <Typography variant='subtitle2' className='TshirtSummaryTitle'>
          T-Shirt Result
        </Typography>
        {summary ? (
          <div className='TshirtSummaryValues'>
            <div className='TshirtSummaryItem'>
              <Typography variant='caption'>Median range</Typography>
              <Typography variant='h6'>{summary.medianLabel}</Typography>
              <Typography variant='body2'>{summary.medianRange}</Typography>
            </div>
            <div className='TshirtSummaryItem'>
              <Typography variant='caption'>Total median value</Typography>
              <Typography variant='h6'>{summary.totalMedianValue}</Typography>
              <Typography variant='body2'>{summary.voteCount} votes</Typography>
            </div>
            <div className={`TshirtSummaryItem TshirtConsensusItem ${summary.consensus.status}`}>
              <Typography variant='caption'>Consensus status</Typography>
              <Typography variant='h6'>{summary.consensus.code}</Typography>
              <Typography variant='body2'>{summary.consensus.message}</Typography>
              <Typography variant='caption' className='TshirtConsensusDetails'>
                Spread: {summary.consensus.rankSpread} | σ:{' '}
                {formatStatistic(summary.consensus.standardDeviation)} | Ratio:{' '}
                {formatStatistic(summary.consensus.effortRatio)}x
              </Typography>
            </div>
          </div>
        ) : (
          <Typography variant='body2'>No T-Shirt votes to summarize.</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export const getTshirtSummary = (
  game: Game,
  players: Player[],
): TshirtSummaryResult | undefined => {
  const cards = game.cards?.length ? game.cards : getCards(game.gameType);
  const votes = players
    .flatMap((player): TshirtVote[] => {
      if (player.status !== Status.Finished || player.value === undefined || player.value < 0) {
        return [];
      }

      const card = cards.find((card) => card.value === player.value);
      const label = card?.displayValue;
      const range = label ? tshirtEffortRanges[label] : undefined;
      const rank = label ? tshirtRankMap[label] : undefined;

      return range && card && rank ? [{ value: card.value, label, range, rank }] : [];
    })
    .sort((a, b) => a.value - b.value);

  if (!votes.length) {
    return undefined;
  }

  const lowerMiddle = votes[Math.floor((votes.length - 1) / 2)];
  const upperMiddle = votes[Math.ceil((votes.length - 1) / 2)];
  const rangeMin = lowerMiddle.range.min;
  const rangeMax = upperMiddle.range.max;
  const medianValue = (getRangeMedian(lowerMiddle.range) + getRangeMedian(upperMiddle.range)) / 2;

  return {
    medianLabel:
      lowerMiddle.label === upperMiddle.label
        ? lowerMiddle.label
        : `${lowerMiddle.label}-${upperMiddle.label}`,
    medianRange: `${rangeMin}-${rangeMax} PD`,
    totalMedianValue: `${formatMedianValue(medianValue)} PD`,
    voteCount: votes.length,
    consensus: getTshirtConsensus(votes),
  };
};

const getRangeMedian = (range: TshirtEffortRange): number => {
  return (range.min + range.max) / 2;
};

const formatMedianValue = (value: number): string => {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
};

const getTshirtConsensus = (votes: TshirtVote[]): TshirtConsensusResult => {
  const ranks = votes.map((vote) => vote.rank);
  const rankSpread = Math.max(...ranks) - Math.min(...ranks);
  const standardDeviation = getStandardDeviation(ranks);
  const effortRatio = getEffortRatio(votes);

  if (rankSpread >= 3 || (votes.length > 2 && standardDeviation > 1.5)) {
    return {
      status: TshirtConsensusStatus.CriticalSpread,
      code: 'CRITICAL SPREAD',
      message: 'Discussion required!',
      rankSpread,
      standardDeviation,
      effortRatio,
    };
  }

  if (rankSpread === 2) {
    return {
      status: TshirtConsensusStatus.ModerateSpread,
      code: 'MODERATE SPREAD',
      message: 'Short clarification recommended.',
      rankSpread,
      standardDeviation,
      effortRatio,
    };
  }

  return {
    status: TshirtConsensusStatus.Consensus,
    code: 'CONSENSUS',
    message: 'Estimate plausible.',
    rankSpread,
    standardDeviation,
    effortRatio,
  };
};

const getStandardDeviation = (values: number[]): number => {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;

  return Math.sqrt(variance);
};

const getEffortRatio = (votes: TshirtVote[]): number => {
  const lowestRangeMin = Math.min(...votes.map((vote) => vote.range.min));
  const highestRangeMax = Math.max(...votes.map((vote) => vote.range.max));

  return highestRangeMax / lowestRangeMin;
};

const formatStatistic = (value: number): string => {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
};
