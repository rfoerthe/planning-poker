import React from 'react';
import { useTranslation } from 'react-i18next';
import { Game, GameType } from '../../../types/game';
import { Player } from '../../../types/player';
import { Status } from '../../../types/status';
import {
  getMedianIndexes,
  isCriticalSpread,
  moderateRankSpread,
} from '../../../service/statistics';
import { getCards } from '../../Players/CardPicker/CardConfigs';
import { ConsensusVerdict } from '../ConsensusVerdict/ConsensusVerdict';
import { DeviationKpi } from '../DeviationKpi/DeviationKpi';
import {
  ExplainerContent,
  ExplainerStep,
  StatExplainer,
  Translate,
} from '../StatExplainer/StatExplainer';
import {
  getDeviationContent,
  getScaleSteps,
  getSpreadContent,
  getVerdictContent,
  ScaleWording,
} from '../StatExplainer/voteScale';

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
  /** Every counted vote, smallest size first. Carries the ranks the spread is built on. */
  votes: TshirtVote[];
  /**
   * The vote or votes in the middle of the sorted list. Both entries are the
   * same vote for an odd number of votes, and the two middle ones otherwise.
   */
  medianVotes: [TshirtVote, TshirtVote];
  /** Where those sit in the sorted list, counted from one, for the walkthrough. */
  medianPositions: [number, number];
  medianValue: number;
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
        <TshirtSummaryBody summary={summary} />
      ) : (
        <p className='StatPanelEmpty'>{t('tshirtSummary.empty')}</p>
      )}
    </section>
  );
};

/**
 * The evaluated panel. Split off so the derived explanations can be built from
 * a summary that is known to exist, rather than guarded at every use.
 */
const TshirtSummaryBody: React.FC<{ summary: TshirtSummaryResult }> = ({ summary }) => {
  const { t } = useTranslation();

  const wording: ScaleWording = {
    itemLabel: t('deviation.sizeLabel'),
    stepLabel: t('deviation.stepLabel'),
    scalePlural: t('deviation.scaleSteps'),
    deviationHeading: t('deviation.headingSizes'),
    spreadHeading: t('spread.headingSizes'),
    spreadIntro: t('spread.introSizes'),
    hint: t('deviation.hintSizes'),
  };
  const scaleSteps = getScaleSteps(
    summary.votes.map((vote) => ({ label: vote.label, rank: vote.rank })),
  );
  const deviationContent = getDeviationContent(
    scaleSteps,
    summary.consensus.standardDeviation,
    wording,
    t,
  );

  return (
    <>
      <StatExplainer
        content={{
          heading: t('tshirtSummary.medianSizeHelp.heading'),
          intro: t('median.intro'),
          steps: getMedianSizeSteps(summary, t),
        }}
      >
        <button type='button' className='StatTrigger HeroTrigger' data-testid='tshirt-median-size'>
          <span className='StatHeroValue'>{summary.medianLabel}</span>
          <span className='StatHeroUnit'>{t('tshirtSummary.medianSize')}</span>
        </button>
      </StatExplainer>
      <p className='StatSubline'>
        <StatExplainer
          content={{
            heading: t('tshirtSummary.effortRangeHelp.heading'),
            intro: t('tshirtSummary.effortRangeHelp.intro'),
            steps: [
              {
                label: t('tshirtSummary.effortRangeHelp.step', { size: summary.medianLabel }),
                calc: summary.medianRange,
              },
            ],
          }}
        >
          <button
            type='button'
            className='StatTrigger TextTrigger'
            data-testid='tshirt-effort-range'
          >
            {t('tshirtSummary.effortRange', { range: summary.medianRange })}
          </button>
        </StatExplainer>
      </p>

      <div className='KpiGrid'>
        <StatExplainer
          content={{
            heading: t('tshirtSummary.medianEffortHelp.heading'),
            intro: t('tshirtSummary.medianEffortHelp.intro'),
            steps: getMedianEffortSteps(summary, t),
          }}
        >
          <button
            type='button'
            className='StatTrigger KpiTrigger'
            data-testid='tshirt-median-effort'
          >
            <div className='KpiLabel'>{t('tshirtSummary.totalMedianValue')}</div>
            <div className='KpiValue'>{summary.totalMedianValue}</div>
          </button>
        </StatExplainer>
        <DeviationKpi
          unit={t('deviation.unitSizes')}
          standardDeviation={summary.consensus.standardDeviation}
          content={deviationContent}
          testId='tshirt-deviation'
        />
      </div>

      <ConsensusVerdict
        status={summary.consensus.status}
        rankSpread={summary.consensus.rankSpread}
        standardDeviation={summary.consensus.standardDeviation}
        ratio={summary.consensus.effortRatio}
        explanations={{
          status: getVerdictContent(
            summary.consensus.rankSpread,
            summary.consensus.standardDeviation,
            summary.voteCount,
            t,
          ),
          spread: getSpreadContent(scaleSteps, wording, t),
          deviation: deviationContent,
          ratio: getRatioContent(summary, t),
        }}
        testId='tshirt-consensus'
      />
    </>
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

  const [lowerIndex, upperIndex] = getMedianIndexes(votes.length);
  const lowerMiddle = votes[lowerIndex];
  const upperMiddle = votes[upperIndex];
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
    votes,
    medianVotes: [lowerMiddle, upperMiddle],
    medianPositions: [lowerIndex + 1, upperIndex + 1],
    medianValue,
    voteCount: votes.length,
    consensus: getTshirtConsensus(votes),
  };
};

/**
 * Sorting the votes and pointing at the middle of the list is the whole of the
 * median, so the walkthrough is exactly those two moves.
 */
const getMedianSizeSteps = (summary: TshirtSummaryResult, t: Translate): ExplainerStep[] => {
  const [lower, upper] = summary.medianVotes;
  const [lowerPosition, upperPosition] = summary.medianPositions;
  const sorted = summary.votes.map((vote) => vote.label).join(' · ');
  const sortStep = { label: t('median.stepSort'), calc: sorted };

  if (lowerPosition === upperPosition) {
    return [
      sortStep,
      {
        label: t('median.stepMiddleOne', {
          position: lowerPosition,
          count: summary.voteCount,
        }),
        calc: lower.label,
      },
    ];
  }

  return [
    sortStep,
    {
      label: t('median.stepMiddleTwo', {
        first: lowerPosition,
        second: upperPosition,
        count: summary.voteCount,
      }),
      calc: `${lower.label} · ${upper.label} → ${summary.medianLabel}`,
    },
  ];
};

/** An even number of votes lands between two sizes, which needs one step more. */
const getMedianEffortSteps = (summary: TshirtSummaryResult, t: Translate): ExplainerStep[] => {
  const [lower, upper] = summary.medianVotes;
  const median = `${formatStatistic(summary.medianValue)} ${effortUnit}`;

  if (lower.label === upper.label) {
    return [
      {
        label: t('tshirtSummary.medianEffortHelp.stepRangeOne', { size: lower.label }),
        calc: `${lower.range.min}–${lower.range.max} ${effortUnit}`,
      },
      {
        label: t('tshirtSummary.medianEffortHelp.stepMiddleOne'),
        calc: `(${lower.range.min} + ${lower.range.max}) ÷ 2 = ${median}`,
      },
    ];
  }

  const lowerMiddle = formatStatistic(getRangeMedian(lower.range));
  const upperMiddle = formatStatistic(getRangeMedian(upper.range));

  return [
    {
      label: t('tshirtSummary.medianEffortHelp.stepRangeTwo'),
      calc: `${lower.label}: ${lower.range.min}–${lower.range.max} · ${upper.label}: ${upper.range.min}–${upper.range.max}`,
    },
    {
      label: t('tshirtSummary.medianEffortHelp.stepMiddleTwo'),
      calc: `(${lower.range.min} + ${lower.range.max}) ÷ 2 = ${lowerMiddle} · (${upper.range.min} + ${upper.range.max}) ÷ 2 = ${upperMiddle}`,
    },
    {
      label: t('tshirtSummary.medianEffortHelp.stepAverage'),
      calc: `(${lowerMiddle} + ${upperMiddle}) ÷ 2 = ${median}`,
    },
  ];
};

/**
 * Unlike the spread figures, the ratio is about effort rather than steps: it
 * answers how many times bigger the largest estimate is than the smallest. A
 * size covers a whole range, so each one is taken at the middle of its range.
 */
const getRatioContent = (summary: TshirtSummaryResult, t: Translate): ExplainerContent => {
  const efforts = summary.votes.map((vote) => ({ vote, effort: getRangeMedian(vote.range) }));
  const smallest = efforts.reduce((a, b) => (b.effort < a.effort ? b : a));
  const largest = efforts.reduce((a, b) => (b.effort > a.effort ? b : a));

  return {
    heading: t('ratio.heading'),
    intro: t('ratio.introSizes'),
    steps: [
      {
        label: t('ratio.stepLargest', { size: largest.vote.label }),
        calc: `(${largest.vote.range.min} + ${largest.vote.range.max}) ÷ 2 = ${formatStatistic(
          largest.effort,
        )} ${effortUnit}`,
      },
      {
        label: t('ratio.stepSmallest', { size: smallest.vote.label }),
        calc: `(${smallest.vote.range.min} + ${smallest.vote.range.max}) ÷ 2 = ${formatStatistic(
          smallest.effort,
        )} ${effortUnit}`,
      },
      {
        label: t('ratio.stepDivide'),
        calc: `${formatStatistic(largest.effort)} ÷ ${formatStatistic(
          smallest.effort,
        )} = ${formatStatistic(summary.consensus.effortRatio)}`,
      },
    ],
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

  if (isCriticalSpread(rankSpread, standardDeviation, votes.length)) {
    return {
      status: TshirtConsensusStatus.CriticalSpread,
      rankSpread,
      standardDeviation,
      effortRatio,
    };
  }

  if (rankSpread === moderateRankSpread) {
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

/**
 * How much bigger the largest estimate is than the smallest, on the same terms
 * as a numeric deck: one estimate against the other.
 *
 * A size covers a whole range, so it is represented by the middle of that
 * range. Holding the top of one range against the bottom of another would
 * compare two different things and make even neighbouring sizes look far
 * apart — S against M would read as 4,5× where the sizes are one step apart.
 */
const getEffortRatio = (votes: TshirtVote[]): number => {
  const efforts = votes.map((vote) => getRangeMedian(vote.range));

  return Math.max(...efforts) / Math.min(...efforts);
};

const formatStatistic = (value: number): string => {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1).replace('.', ',');
};
