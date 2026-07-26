import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  formatNumber,
  getMedian,
  getMedianIndexes,
  minimumVotesForOutliers,
  NumericSummaryResult,
  outlierRankDistance,
} from '../../../service/statistics';
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
import './NumericSummary.css';

interface NumericSummaryProps {
  summary: NumericSummaryResult;
}

export const NumericSummary: React.FC<NumericSummaryProps> = ({ summary }) => {
  const { t } = useTranslation();
  const votesLabel = t('common.votes', { count: summary.voteCount });

  const wording: ScaleWording = {
    itemLabel: t('deviation.cardLabel'),
    stepLabel: t('deviation.positionLabel'),
    scalePlural: t('deviation.scalePositions'),
    deviationHeading: t('deviation.headingCards'),
    spreadHeading: t('spread.headingCards'),
    spreadIntro: t('spread.introCards'),
    hint: t('deviation.hintCards'),
  };
  const scaleSteps = getScaleSteps(
    summary.votes.map((vote) => ({ label: vote.displayValue, rank: vote.rank })),
  );
  const deviationContent = getDeviationContent(
    scaleSteps,
    summary.consensus.standardDeviation,
    wording,
    t,
  );

  return (
    <section className='StatPanel' data-testid='numeric-summary'>
      <div className='StatPanelHead'>
        <h2 className='StatPanelTitle'>{t('numericSummary.title')}</h2>
        <span className='StatusPill StatusPillDone'>{votesLabel}</span>
      </div>

      <StatExplainer
        content={{
          heading: t('numericSummary.medianHelp.heading'),
          intro: t('median.intro'),
          steps: getMedianSteps(summary, t),
          hint: t('numericSummary.medianHelp.hint'),
        }}
      >
        <button type='button' className='StatTrigger HeroTrigger' data-testid='summary-median'>
          <span className='StatHeroValue'>{formatNumber(summary.median)}</span>
          <span className='StatHeroUnit'>{t('numericSummary.median')}</span>
        </button>
      </StatExplainer>
      <p className='StatSubline'>
        <StatExplainer content={getRecommendationContent(summary, t)}>
          <button
            type='button'
            className='StatTrigger TextTrigger'
            data-testid='summary-recommendation'
          >
            {t('numericSummary.recommendation', { card: summary.recommendedCard.displayValue })}
          </button>
        </StatExplainer>
      </p>

      <div className='KpiGrid'>
        <StatExplainer content={getAverageContent(summary, t)}>
          <button type='button' className='StatTrigger KpiTrigger' data-testid='summary-average'>
            <div className='KpiLabel'>{t('numericSummary.average')}</div>
            <div className='KpiValue'>{formatNumber(summary.average)}</div>
          </button>
        </StatExplainer>
        <DeviationKpi
          unit={t('deviation.unitCards')}
          standardDeviation={summary.consensus.standardDeviation}
          content={deviationContent}
          testId='summary-deviation'
        />
        <StatExplainer
          content={{
            heading: t('numericSummary.rangeHelp.heading'),
            intro: t('numericSummary.rangeHelp.intro'),
            steps: [
              {
                label: t('numericSummary.rangeHelp.step'),
                calc: `${summary.votes.map((vote) => vote.displayValue).join(' · ')} → ${
                  summary.lowest.displayValue
                }–${summary.highest.displayValue}`,
              },
            ],
            hint: t('numericSummary.rangeHelp.hint'),
          }}
        >
          <button type='button' className='StatTrigger KpiTrigger' data-testid='summary-range'>
            <div className='KpiLabel'>{t('numericSummary.range')}</div>
            <div className='KpiValue'>
              {summary.lowest.displayValue}–{summary.highest.displayValue}
            </div>
          </button>
        </StatExplainer>
        <StatExplainer
          content={{
            heading: t('numericSummary.abstentionsHelp.heading'),
            intro: t('numericSummary.abstentionsHelp.intro'),
            hint: t('numericSummary.abstentionsHelp.hint'),
          }}
        >
          <button type='button' className='StatTrigger KpiTrigger' data-testid='summary-abstentions'>
            <div className='KpiLabel'>{t('numericSummary.abstentions')}</div>
            <div className='KpiValue'>{summary.abstentionCount}</div>
          </button>
        </StatExplainer>
      </div>

      <ConsensusVerdict
        status={summary.consensus.status}
        rankSpread={summary.consensus.rankSpread}
        standardDeviation={summary.consensus.standardDeviation}
        ratio={summary.consensus.spreadRatio}
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
        testId='summary-consensus'
      />

      <div className='SectionLabel NumericDistributionTitle'>
        {t('numericSummary.distribution')}: {votesLabel}
        {summary.abstentionCount > 0 &&
          `, ${t('numericSummary.withoutEstimate', { count: summary.abstentionCount })}`}
      </div>
      <div className='MiniBarList'>
        {summary.distribution.map((entry) => (
          <div className='MiniBarRow' key={entry.value}>
            <span className='MiniBarLabel'>{entry.displayValue}</span>
            <span
              className='MiniBarTrack'
              title={t('numericSummary.distributionTooltip', {
                votes: t('common.votes', { count: entry.count }),
                card: entry.displayValue,
              })}
            >
              <i
                className='MiniBarFill'
                style={{
                  width: `${Math.round(entry.share * 100)}%`,
                  backgroundColor: getBarColor(entry.color),
                }}
              />
            </span>
            <span className='MiniBarCount'>{entry.count}</span>
          </div>
        ))}
      </div>

      {summary.outliers.length > 0 && (
        <p className='NumericSummaryOutliers'>
          <StatExplainer content={getOutlierContent(summary, t)}>
            <button
              type='button'
              className='StatTrigger TextTrigger'
              data-testid='summary-outliers'
            >
              {t('numericSummary.outliersLabel', {
                names: summary.outliers.map(formatOutlier).join(', '),
              })}
            </button>
          </StatExplainer>
        </p>
      )}
    </section>
  );
};

/**
 * Sorting the votes and pointing at the middle of the list is the whole of the
 * median. An even number of votes has no single middle, so the two around it
 * are averaged — which is why the result can be a value no card carries.
 */
const getMedianSteps = (summary: NumericSummaryResult, t: Translate): ExplainerStep[] => {
  const count = summary.votes.length;
  const [lowerIndex, upperIndex] = getMedianIndexes(count);
  const sortStep = {
    label: t('median.stepSort'),
    calc: summary.votes.map((vote) => vote.displayValue).join(' · '),
  };

  if (lowerIndex === upperIndex) {
    return [
      sortStep,
      {
        label: t('median.stepMiddleOne', { position: lowerIndex + 1, count }),
        calc: summary.votes[lowerIndex].displayValue,
      },
    ];
  }

  const lower = summary.votes[lowerIndex];
  const upper = summary.votes[upperIndex];

  return [
    sortStep,
    {
      label: t('median.stepMiddleTwoAverage', {
        first: lowerIndex + 1,
        second: upperIndex + 1,
        count,
      }),
      calc: `(${lower.value} + ${upper.value}) ÷ 2 = ${formatNumber(summary.median)}`,
    },
  ];
};

const getAverageContent = (summary: NumericSummaryResult, t: Translate): ExplainerContent => ({
  heading: t('numericSummary.averageHelp.heading'),
  intro: t('numericSummary.averageHelp.intro'),
  steps: [
    {
      label: t('numericSummary.averageHelp.step'),
      calc: `(${summary.votes.map((vote) => vote.value).join(' + ')}) ÷ ${
        summary.votes.length
      } = ${formatNumber(summary.average)}`,
    },
  ],
});

/** Which card the average is closest to, and how close its neighbour came. */
const getRecommendationContent = (
  summary: NumericSummaryResult,
  t: Translate,
): ExplainerContent => ({
  heading: t('numericSummary.recommendationHelp.heading'),
  intro: t('numericSummary.recommendationHelp.intro'),
  steps: [
    { label: t('numericSummary.averageLabel'), calc: formatNumber(summary.average) },
    {
      label: t('numericSummary.recommendationHelp.stepDistances'),
      calc: summary.recommendationCandidates
        .map(
          (card) =>
            `${card.displayValue} → ${formatNumber(Math.abs(card.value - summary.average))}`,
        )
        .join(' · '),
    },
  ],
  hint: t('numericSummary.recommendationHelp.hint'),
});

/**
 * Outliers are picked on the same step scale as the spread, measured from the
 * middle of the field rather than from either end.
 */
const getOutlierContent = (summary: NumericSummaryResult, t: Translate): ExplainerContent => {
  const medianRank = getMedian(summary.votes.map((vote) => vote.rank));

  return {
    heading: t('numericSummary.outlierHelp.heading'),
    intro: t('numericSummary.outlierHelp.intro'),
    steps: [
      { label: t('numericSummary.outlierHelp.stepMedian'), calc: formatNumber(medianRank) },
      {
        label: t('numericSummary.outlierHelp.stepDistances'),
        calc: summary.votes
          .map(
            (vote) => `${vote.displayValue} → ${formatNumber(Math.abs(vote.rank - medianRank))}`,
          )
          .join(' · '),
      },
      {
        label: t('numericSummary.outlierHelp.stepPick', { distance: outlierRankDistance }),
        calc: summary.outliers.map((outlier) => outlier.displayValue).join(' · '),
      },
    ],
    hint: t('numericSummary.outlierHelp.hint', { minimum: minimumVotesForOutliers }),
  };
};

/**
 * Unlike the spread figures, the ratio does compare the values on the cards:
 * it answers how many times bigger one estimate is than another, which only
 * the values themselves can say.
 */
const getRatioContent = (
  summary: NumericSummaryResult,
  t: Translate,
): ExplainerContent | undefined => {
  if (summary.consensus.spreadRatio === undefined) {
    return undefined;
  }

  return {
    heading: t('ratio.heading'),
    intro: t('ratio.introCards'),
    steps: [
      {
        label: t('ratio.stepDivide'),
        calc: `${summary.highest.value} ÷ ${summary.lowest.value} = ${formatNumber(
          summary.consensus.spreadRatio,
        )}`,
      },
    ],
  };
};

const formatOutlier = (outlier: { playerName: string; displayValue: string }): string =>
  `${outlier.playerName} (${outlier.displayValue})`;

// Neutral card colors are theme variables and would be invisible as a bar.
const getBarColor = (cardColor: string): string =>
  cardColor.startsWith('#') ? cardColor : 'var(--color-primary)';
