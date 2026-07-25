import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../../service/statistics';
import './ConsensusVerdict.css';

interface ConsensusVerdictProps {
  /** Kebab-case status shared by the numeric and the t-shirt evaluation. */
  status: string;
  rankSpread: number;
  standardDeviation: number;
  ratio?: number;
  testId?: string;
}

/**
 * How well the team agrees, in the same shape for every deck type.
 */
export const ConsensusVerdict: React.FC<ConsensusVerdictProps> = ({
  status,
  rankSpread,
  standardDeviation,
  ratio,
  testId,
}) => {
  const { t } = useTranslation();
  const details =
    ratio === undefined
      ? t('consensus.details', {
          spread: rankSpread,
          deviation: formatNumber(standardDeviation),
        })
      : t('consensus.detailsWithRatio', {
          spread: rankSpread,
          deviation: formatNumber(standardDeviation),
          ratio: formatNumber(ratio),
        });

  return (
    <div className={`Verdict ${status}`} data-testid={testId}>
      <span className='VerdictBadge' aria-hidden='true'>
        {t(`consensus.${status}.badge`)}
      </span>
      <span className='VerdictBody'>
        <span className='VerdictTitle'>{t(`consensus.${status}.code`)}</span>
        <span className='VerdictText'>{t(`consensus.${status}.message`)}</span>
        <span className='VerdictText VerdictDetails'>{details}</span>
      </span>
    </div>
  );
};
