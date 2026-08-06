import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../../service/statistics';
import { ExplainerContent, StatExplainer } from '../StatExplainer/StatExplainer';
import './DeviationKpi.css';

interface DeviationKpiProps {
  /** What a step means on this deck, shown next to the σ label. */
  unit: string;
  standardDeviation: number;
  content: ExplainerContent;
  testId?: string;
}

/**
 * The spread of the votes, with a hover explanation of how it was derived.
 *
 * The number is easy to misread next to the estimates: it counts steps on the
 * deck, not the values on the cards.
 */
export const DeviationKpi: React.FC<DeviationKpiProps> = ({
  unit,
  standardDeviation,
  content,
  testId,
}) => {
  const { t } = useTranslation();

  return (
    <StatExplainer content={content}>
      <button type='button' className='StatTrigger KpiTrigger' data-testid={testId}>
        <div className='KpiLabel'>
          {t('deviation.label')} <span className='DeviationKpiUnit'>{unit}</span>
        </div>
        <div className='KpiValue'>{formatNumber(standardDeviation)}</div>
      </button>
    </StatExplainer>
  );
};
