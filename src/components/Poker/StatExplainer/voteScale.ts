import {
  criticalRankSpread,
  criticalStandardDeviation,
  formatNumber,
  minimumVotesForDeviationRule,
  moderateRankSpread,
} from '../../../service/statistics';
import { ExplainerContent, ExplainerRow, Translate } from './StatExplainer';

/**
 * Spread figures are not built from the values on the cards but from the
 * position each card holds in its deck, because the distance between two
 * estimates grows with their size. This module owns everything that follows
 * from that, so the numeric and the t-shirt panel cannot drift apart.
 */

/** A counted vote reduced to what the spread figures are built from. */
export interface ScaleVote {
  label: string;
  rank: number;
}

/** One distinct card or size that was voted for. */
export interface ScaleStep {
  label: string;
  rank: number;
  count: number;
}

/** How a deck names its scale, so the explanations read in its own terms. */
export interface ScaleWording {
  /** Row header for what was voted, e.g. 'Karte' or 'Größe'. */
  itemLabel: string;
  /** Row header for where it sits, e.g. 'Position' or 'Stufe'. */
  stepLabel: string;
  /** Plural of what is averaged, e.g. 'Positionen' or 'Stufen'. */
  scalePlural: string;
  deviationHeading: string;
  spreadHeading: string;
  spreadIntro: string;
  hint: string;
}

/**
 * Two decimals, unlike the rest of the panel.
 *
 * The variance is the one place where a single decimal breaks the walkthrough:
 * rounding it to 0,9 makes the closing √0,9 = 1,0 look like a mistake, because
 * the root of the rounded value is 0,95.
 */
const formatVariance = (value: number): string => value.toFixed(2).replace('.', ',');

/** One column per voted card, so a card two people picked stays a single column. */
export const getScaleSteps = (votes: ScaleVote[]): ScaleStep[] => {
  const steps = new Map<number, ScaleStep>();

  votes.forEach((vote) => {
    const step = steps.get(vote.rank);
    if (step) {
      step.count += 1;
      return;
    }
    steps.set(vote.rank, { label: vote.label, rank: vote.rank, count: 1 });
  });

  return [...steps.values()].sort((a, b) => a.rank - b.rank);
};

/** The vote overview both spread explanations open with. */
const getRows = (steps: ScaleStep[], wording: ScaleWording, t: Translate): ExplainerRow[] => {
  const rows: ExplainerRow[] = [
    { label: wording.itemLabel, cells: steps.map((step) => step.label) },
    { label: wording.stepLabel, cells: steps.map((step) => step.rank) },
  ];

  if (steps.some((step) => step.count > 1)) {
    rows.push({ label: t('deviation.votesLabel'), cells: steps.map((step) => step.count) });
  }

  return rows;
};

export const getDeviationContent = (
  steps: ScaleStep[],
  standardDeviation: number,
  wording: ScaleWording,
  t: Translate,
): ExplainerContent => {
  // One entry per vote, so a card two people picked counts twice in the sums.
  const ranks = steps.flatMap((step) => Array<number>(step.count).fill(step.rank));
  const mean = ranks.length ? ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length : 0;
  const deviations = ranks.map((rank) => rank - mean);
  const variance = Math.pow(standardDeviation, 2);

  return {
    heading: wording.deviationHeading,
    rows: getRows(steps, wording, t),
    steps: [
      {
        label: t('deviation.stepMean', { scale: wording.scalePlural }),
        calc: `(${ranks.join(' + ')}) ÷ ${ranks.length} = ${formatNumber(mean)}`,
      },
      {
        label: t('deviation.stepDeviations'),
        calc: deviations.map((deviation) => formatNumber(deviation)).join(' · '),
      },
      {
        label: t('deviation.stepSquares'),
        calc: `(${deviations
          .map((deviation) => `${formatNumber(Math.abs(deviation))}²`)
          .join(' + ')}) ÷ ${ranks.length} = ${formatVariance(variance)}`,
      },
      {
        label: t('deviation.stepRoot'),
        calc: `σ = √${formatVariance(variance)} = ${formatNumber(standardDeviation)}`,
      },
    ],
    hint: wording.hint,
  };
};

/**
 * Why the round came out as it did.
 *
 * Names the two thresholds and then which of them the round actually crossed,
 * because "Kritische Streuung" on its own reads like a judgement rather than
 * the outcome of a rule.
 */
export const getVerdictContent = (
  rankSpread: number,
  standardDeviation: number,
  voteCount: number,
  t: Translate,
): ExplainerContent => {
  const spreadIsCritical = rankSpread >= criticalRankSpread;
  const deviationCounts = voteCount > minimumVotesForDeviationRule;
  const deviationIsCritical = deviationCounts && standardDeviation > criticalStandardDeviation;

  return {
    heading: t('verdict.heading'),
    intro: t('verdict.intro'),
    steps: [
      {
        label: t('verdict.stepSpread'),
        calc: t('verdict.spreadValue', { count: rankSpread, limit: criticalRankSpread }),
      },
      {
        label: t('verdict.stepDeviation'),
        calc: deviationCounts
          ? t('verdict.deviationValue', {
              deviation: formatNumber(standardDeviation),
              limit: formatNumber(criticalStandardDeviation),
            })
          : t('verdict.deviationIgnored', {
              deviation: formatNumber(standardDeviation),
              minimum: minimumVotesForDeviationRule + 1,
            }),
      },
      {
        label: t('verdict.stepResult'),
        calc: t(getResultKey(spreadIsCritical, deviationIsCritical, rankSpread), {
          moderate: moderateRankSpread,
        }),
      },
    ],
  };
};

const getResultKey = (
  spreadIsCritical: boolean,
  deviationIsCritical: boolean,
  rankSpread: number,
): string => {
  if (spreadIsCritical && deviationIsCritical) {
    return 'verdict.resultBoth';
  }
  if (spreadIsCritical) {
    return 'verdict.resultSpread';
  }
  if (deviationIsCritical) {
    return 'verdict.resultDeviation';
  }
  return rankSpread === moderateRankSpread ? 'verdict.resultModerate' : 'verdict.resultConsensus';
};

export const getSpreadContent = (
  steps: ScaleStep[],
  wording: ScaleWording,
  t: Translate,
): ExplainerContent => {
  const lowest = steps[0];
  const highest = steps[steps.length - 1];

  return {
    heading: wording.spreadHeading,
    intro: wording.spreadIntro,
    rows: getRows(steps, wording, t),
    steps: [
      {
        label: t('spread.stepEnds'),
        calc: `${lowest.label} → ${lowest.rank} · ${highest.label} → ${highest.rank}`,
      },
      {
        label: t('spread.stepDifference'),
        calc: `${highest.rank} − ${lowest.rank} = ${highest.rank - lowest.rank}`,
      },
    ],
    hint: wording.hint,
  };
};
