import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../../service/statistics';
import { ExplainerContent, StatExplainer } from '../StatExplainer/StatExplainer';
import './ConsensusVerdict.css';

/** The explanations behind the three figures of the details line. */
export interface VerdictExplanations {
  /** Why the round came out as it did, behind the status itself. */
  status: ExplainerContent;
  spread: ExplainerContent;
  deviation: ExplainerContent;
  /** Absent when the lowest estimate is zero and no ratio can be formed. */
  ratio?: ExplainerContent;
}

interface ConsensusVerdictProps {
  /** Kebab-case status shared by the numeric and the t-shirt evaluation. */
  status: string;
  rankSpread: number;
  standardDeviation: number;
  ratio?: number;
  explanations: VerdictExplanations;
  testId?: string;
}

/**
 * How well the team agrees, in the same shape for every deck type.
 *
 * Each figure of the details line carries its own walkthrough: on their own
 * they are three bare numbers on a scale that is not the one on the cards.
 */
export const ConsensusVerdict: React.FC<ConsensusVerdictProps> = ({
  status,
  rankSpread,
  standardDeviation,
  ratio,
  explanations,
  testId,
}) => {
  const { t } = useTranslation();

  return (
    <div className={`Verdict ${status}`} data-testid={testId}>
      <span className='VerdictBadge' aria-hidden='true'>
        {t(`consensus.${status}.badge`)}
      </span>
      <span className='VerdictBody'>
        <StatExplainer content={explanations.status}>
          <button
            type='button'
            className='StatTrigger VerdictTitle VerdictFigure'
            data-testid='verdict-status'
          >
            {t(`consensus.${status}.code`)}
          </button>
        </StatExplainer>
        <span className='VerdictText'>{t(`consensus.${status}.message`)}</span>
        <span className='VerdictText VerdictDetails'>
          <StatExplainer content={explanations.spread}>
            <button type='button' className='StatTrigger VerdictFigure' data-testid='verdict-spread'>
              {t('consensus.spread', { count: rankSpread })}
            </button>
          </StatExplainer>
          {' · '}
          <StatExplainer content={explanations.deviation}>
            <button
              type='button'
              className='StatTrigger VerdictFigure'
              data-testid='verdict-deviation'
            >
              {t('consensus.deviation', { deviation: formatNumber(standardDeviation) })}
            </button>
          </StatExplainer>
          {ratio !== undefined && explanations.ratio && (
            <>
              {' · '}
              <StatExplainer content={explanations.ratio}>
                <button
                  type='button'
                  className='StatTrigger VerdictFigure'
                  data-testid='verdict-ratio'
                >
                  {t('consensus.ratio', { ratio: formatNumber(ratio) })}
                </button>
              </StatExplainer>
            </>
          )}
        </span>
      </span>
    </div>
  );
};
