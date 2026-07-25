import React from 'react';
import { useTranslation } from 'react-i18next';
import { Game, GameType } from '../../../types/game';
import { Player } from '../../../types/player';
import { Status } from '../../../types/status';
import { getCards } from '../../Players/CardPicker/CardConfigs';
import { ConsensusVerdict } from '../ConsensusVerdict/ConsensusVerdict';
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

/** Person days, the unit the effort ranges are expressed in. */
const effortUnit = 'PT';

export const TshirtSummary: React.FC<TshirtSummaryProps> = ({ game, players }) => {
  const { t } = useTranslation();
  const summary = getTshirtSummary(game, players);

  if (game.gameStatus !== Status.Finished || game.gameType !== GameType.TShirt) {
    return null;
  }

  return (
    <section className='StatPanel' data-testid='tshirt-summary'>
      <div className='StatPanelHead'>
        <h2 className='StatPanelTitle'>{t('tshirtSummary.title')}</h2>
        {summary && (
          <span className='StatusPill StatusPillDone'>
            {t('common.votes', { count: summary.voteCount })}
          </span>
        )}
      </div>

      {summary ? (
        <>
          <div className='StatHero'>
            <span className='StatHeroValue'>{summary.medianLabel}</span>
            <span className='StatHeroUnit'>{t('tshirtSummary.medianSize')}</span>
          </div>
          <p className='StatSubline'>{summary.medianRange}</p>

          <div className='KpiGrid'>
            <div className='Kpi'>
              <div className='KpiLabel'>{t('tshirtSummary.totalMedianValue')}</div>
              <div className='KpiValue'>{summary.totalMedianValue}</div>
            </div>
            <div className='Kpi'>
              <div className='KpiLabel'>{t('numericSummary.standardDeviation')}</div>
              <div className='KpiValue'>{formatStatistic(summary.consensus.standardDeviation)}</div>
            </div>
          </div>

          <ConsensusVerdict
            status={summary.consensus.status}
            rankSpread={summary.consensus.rankSpread}
            standardDeviation={summary.consensus.standardDeviation}
            ratio={summary.consensus.effortRatio}
            testId='tshirt-consensus'
          />
        </>
      ) : (
        <p className='TshirtSummaryEmpty'>{t('tshirtSummary.empty')}</p>
      )}
    </section>
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

      return label && range && card && rank ? [{ value: card.value, label, range, rank }] : [];
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
    medianRange: `${rangeMin}-${rangeMax} ${effortUnit}`,
    totalMedianValue: `${formatStatistic(medianValue)} ${effortUnit}`,
    voteCount: votes.length,
    consensus: getTshirtConsensus(votes),
  };
};

const getRangeMedian = (range: TshirtEffortRange): number => {
  return (range.min + range.max) / 2;
};

const getTshirtConsensus = (votes: TshirtVote[]): TshirtConsensusResult => {
  const ranks = votes.map((vote) => vote.rank);
  const rankSpread = Math.max(...ranks) - Math.min(...ranks);
  const standardDeviation = getStandardDeviation(ranks);
  const effortRatio = getEffortRatio(votes);

  if (rankSpread >= 3 || (votes.length > 2 && standardDeviation > 1.5)) {
    return {
      status: TshirtConsensusStatus.CriticalSpread,
      rankSpread,
      standardDeviation,
      effortRatio,
    };
  }

  if (rankSpread === 2) {
    return {
      status: TshirtConsensusStatus.ModerateSpread,
      rankSpread,
      standardDeviation,
      effortRatio,
    };
  }

  return {
    status: TshirtConsensusStatus.Consensus,
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
  return Number.isInteger(value) ? value.toString() : value.toFixed(1).replace('.', ',');
};
