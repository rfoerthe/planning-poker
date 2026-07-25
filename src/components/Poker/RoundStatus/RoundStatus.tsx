import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatClock } from '../../../service/timer';
import { Game } from '../../../types/game';
import './RoundStatus.css';

interface RoundStatusProps {
  game: Game;
  votedCount: number;
  totalCount: number;
  remainingSeconds?: number;
}

/**
 * Sidebar panel while the round is still hidden. It shows how far the round has
 * come and how much time is left — never anything about the estimates.
 */
export const RoundStatus: React.FC<RoundStatusProps> = ({
  game,
  votedCount,
  totalCount,
  remainingSeconds,
}) => {
  const { t } = useTranslation();
  const totalSeconds = game.timerDurationSeconds;
  const isTimerRunning = remainingSeconds !== undefined;
  const elapsedShare =
    isTimerRunning && totalSeconds ? Math.min(100, (remainingSeconds / totalSeconds) * 100) : 0;

  return (
    <section className='StatPanel RoundStatus' data-testid='round-status'>
      <div className='StatPanelHead'>
        <h2 className='StatPanelTitle'>{t('roundStatus.title')}</h2>
        <span className='StatusPill StatusPillNeutral'>{t('roundStatus.hidden')}</span>
      </div>

      <div className='StatHero'>
        <span className='StatHeroValue TabularNumbers'>
          {votedCount}
          <span className='RoundStatusOfTotal'>/{totalCount}</span>
        </span>
      </div>
      <p className='StatSubline'>{t('roundStatus.waiting')}</p>

      <div className='KpiGrid'>
        <div className='Kpi'>
          <div className='KpiLabel'>{t('roundStatus.voted')}</div>
          <div className='KpiValue'>{votedCount}</div>
        </div>
        <div className='Kpi'>
          <div className='KpiLabel'>{t('roundStatus.open')}</div>
          <div className='KpiValue'>{Math.max(0, totalCount - votedCount)}</div>
        </div>
      </div>

      <div className='SectionLabel RoundStatusTimerLabel'>{t('roundStatus.timerLabel')}</div>
      {isTimerRunning ? (
        <div className='RoundStatusTimer'>
          <span className='RoundStatusTimerValue TabularNumbers'>
            {formatClock(remainingSeconds)}
          </span>
          <span className='MiniBarTrack RoundStatusTimerTrack'>
            <i className='MiniBarFill RoundStatusTimerFill' style={{ width: `${elapsedShare}%` }} />
          </span>
          {totalSeconds ? (
            <span className='RoundStatusTimerTotal TabularNumbers'>
              {t('timer.remainingOf', { total: formatClock(totalSeconds) })}
            </span>
          ) : null}
        </div>
      ) : (
        <p className='RoundStatusTimerIdle'>{t('roundStatus.timerIdle')}</p>
      )}
    </section>
  );
};
