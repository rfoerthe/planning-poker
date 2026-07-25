import React from 'react';
import { useTranslation } from 'react-i18next';
import './VotingProgress.css';

interface VotingProgressProps {
  votedCount: number;
  totalCount: number;
}

/**
 * How far the round has come, without giving away a single estimate.
 */
export const VotingProgress: React.FC<VotingProgressProps> = ({ votedCount, totalCount }) => {
  const { t } = useTranslation();
  const percent = totalCount === 0 ? 0 : Math.round((votedCount / totalCount) * 100);

  return (
    <div className='VotingProgress' data-testid='voting-progress'>
      <span className='VotingProgressLabel'>
        {t('session.progress', { voted: votedCount, total: totalCount })}
      </span>
      <span
        className='VotingProgressTrack'
        role='progressbar'
        aria-valuemin={0}
        aria-valuemax={totalCount}
        aria-valuenow={votedCount}
      >
        <i style={{ width: `${percent}%` }} />
      </span>
      <span className='VotingProgressPercent TabularNumbers'>{percent} %</span>
    </div>
  );
};
