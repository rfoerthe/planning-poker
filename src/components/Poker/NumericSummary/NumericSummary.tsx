import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber, NumericSummaryResult } from '../../../service/statistics';
import { ConsensusVerdict } from '../ConsensusVerdict/ConsensusVerdict';
import './NumericSummary.css';

interface NumericSummaryProps {
  summary: NumericSummaryResult;
}

export const NumericSummary: React.FC<NumericSummaryProps> = ({ summary }) => {
  const { t } = useTranslation();
  const votesLabel = t('common.votes', { count: summary.voteCount });

  return (
    <section className='StatPanel' data-testid='numeric-summary'>
      <div className='StatPanelHead'>
        <h2 className='StatPanelTitle'>{t('numericSummary.title')}</h2>
        <span className='StatusPill StatusPillDone'>{votesLabel}</span>
      </div>

      <div className='StatHero' data-testid='summary-median'>
        <span className='StatHeroValue'>{formatNumber(summary.median)}</span>
        <span className='StatHeroUnit'>{t('numericSummary.median')}</span>
      </div>
      <p className='StatSubline'>
        {t('numericSummary.nearestCard', { card: summary.recommendedCard.displayValue })}
        {' · '}
        {t('numericSummary.rangeLabel', {
          lowest: summary.lowest.displayValue,
          highest: summary.highest.displayValue,
        })}
      </p>

      <div className='KpiGrid'>
        <div className='Kpi' data-testid='summary-average'>
          <div className='KpiLabel'>{t('numericSummary.average')}</div>
          <div className='KpiValue'>{formatNumber(summary.average)}</div>
        </div>
        <div className='Kpi'>
          <div className='KpiLabel'>{t('numericSummary.standardDeviation')}</div>
          <div className='KpiValue'>{formatNumber(summary.consensus.standardDeviation)}</div>
        </div>
        <div className='Kpi'>
          <div className='KpiLabel'>{t('numericSummary.range')}</div>
          <div className='KpiValue'>
            {summary.lowest.displayValue}–{summary.highest.displayValue}
          </div>
        </div>
        <div className='Kpi'>
          <div className='KpiLabel'>{t('numericSummary.abstentions')}</div>
          <div className='KpiValue'>{summary.abstentionCount}</div>
        </div>
      </div>

      <ConsensusVerdict
        status={summary.consensus.status}
        rankSpread={summary.consensus.rankSpread}
        standardDeviation={summary.consensus.standardDeviation}
        ratio={summary.consensus.spreadRatio}
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
          {t('numericSummary.outliersLabel', {
            names: summary.outliers.map(formatOutlier).join(', '),
          })}
        </p>
      )}
    </section>
  );
};

const formatOutlier = (outlier: { playerName: string; displayValue: string }): string =>
  `${outlier.playerName} (${outlier.displayValue})`;

// Neutral card colors are theme variables and would be invisible as a bar.
const getBarColor = (cardColor: string): string =>
  cardColor.startsWith('#') ? cardColor : 'var(--color-primary)';
