import { Card, CardContent, Typography } from '@mui/material';
import React from 'react';
import { formatNumber, NumericSummaryResult } from '../../../service/statistics';
import './NumericSummary.css';

interface NumericSummaryProps {
  summary: NumericSummaryResult;
}

export const NumericSummary: React.FC<NumericSummaryProps> = ({ summary }) => {
  return (
    <Card variant='outlined' className='NumericSummaryCard' data-testid='numeric-summary'>
      <CardContent className='NumericSummaryContent'>
        <Typography variant='subtitle2' className='NumericSummaryTitle'>
          Estimate Result
        </Typography>
        <div className='NumericSummaryValues'>
          <div className='NumericSummaryItem' data-testid='summary-average'>
            <Typography variant='caption'>Average</Typography>
            <Typography variant='h6'>{formatNumber(summary.average)}</Typography>
            <Typography variant='body2'>
              Nearest card: {summary.recommendedCard.displayValue}
            </Typography>
          </div>
          <div className='NumericSummaryItem' data-testid='summary-median'>
            <Typography variant='caption'>Median</Typography>
            <Typography variant='h6'>{formatNumber(summary.median)}</Typography>
            <Typography variant='body2'>
              Range: {summary.lowest.displayValue} – {summary.highest.displayValue}
            </Typography>
          </div>
          <div
            className={`NumericSummaryItem NumericConsensusItem ${summary.consensus.status}`}
            data-testid='summary-consensus'
          >
            <Typography variant='caption'>Consensus status</Typography>
            <Typography variant='h6'>{summary.consensus.code}</Typography>
            <Typography variant='body2'>{summary.consensus.message}</Typography>
            <Typography variant='caption' className='NumericConsensusDetails'>
              Spread: {summary.consensus.rankSpread} | σ:{' '}
              {formatNumber(summary.consensus.standardDeviation)}
              {summary.consensus.spreadRatio !== undefined &&
                ` | Ratio: ${formatNumber(summary.consensus.spreadRatio)}x`}
            </Typography>
          </div>
        </div>
        <div className='NumericSummaryDistribution'>
          <Typography variant='caption' className='NumericDistributionTitle'>
            Distribution: {formatVotes(summary.voteCount)}
            {summary.abstentionCount > 0 && `, ${summary.abstentionCount} without estimate`}
          </Typography>
          {summary.distribution.map((entry) => (
            <div className='NumericDistributionRow' key={entry.value}>
              <Typography variant='body2' className='NumericDistributionLabel'>
                {entry.displayValue}
              </Typography>
              <div
                className='NumericDistributionTrack'
                title={`${formatVotes(entry.count)} for ${entry.displayValue}`}
              >
                <div
                  className='NumericDistributionBar'
                  style={{
                    width: `${Math.round(entry.share * 100)}%`,
                    backgroundColor: getBarColor(entry.color),
                  }}
                />
              </div>
              <Typography variant='body2' className='NumericDistributionCount'>
                {entry.count}
              </Typography>
            </div>
          ))}
        </div>
        {summary.outliers.length > 0 && (
          <Typography variant='caption' className='NumericSummaryOutliers'>
            Outliers: {summary.outliers.map(formatOutlier).join(', ')}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const formatOutlier = (outlier: { playerName: string; displayValue: string }): string =>
  `${outlier.playerName} (${outlier.displayValue})`;

const formatVotes = (count: number): string => `${count} ${count === 1 ? 'vote' : 'votes'}`;

// Neutral card colors are theme variables and would be invisible as a bar.
const getBarColor = (cardColor: string): string =>
  cardColor.startsWith('#') ? cardColor : 'var(--color-primary)';
