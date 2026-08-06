import { Tooltip } from '@mui/material';
import React, { Fragment, ReactElement, ReactNode } from 'react';
import './StatExplainer.css';

/** One aligned row of the vote overview, e.g. the sizes and the steps they sit on. */
export interface ExplainerRow {
  label: string;
  cells: ReactNode[];
}

export interface ExplainerStep {
  label: string;
  calc: ReactNode;
}

/**
 * Everything an explanation says, without the element it hangs off. Built by
 * the panel that owns the votes, so the same content can be shown at more than
 * one place — the spread appears both as a tile and inside the verdict.
 */
export interface ExplainerContent {
  heading: string;
  /** Lead-in that says what the statistic is, before the arithmetic starts. */
  intro?: string;
  rows?: ExplainerRow[];
  /** Absent where a figure is a plain reading and there is nothing to walk through. */
  steps?: ExplainerStep[];
  /** Closing note, set off by a rule. */
  hint?: string;
}

/** The subset of i18next's `t` these builders need. */
export type Translate = (key: string, options?: Record<string, unknown>) => string;

interface StatExplainerProps {
  content: ExplainerContent;
  /** The element the explanation hangs off. Must be able to take a ref and focus. */
  children: ReactElement;
}

/**
 * A hover explanation for a single figure in a summary panel.
 *
 * Every statistic here is derived from the round's own votes, and none of them
 * is self-evident from the number alone. The explanation therefore walks
 * through the actual arithmetic of this round instead of stating a formula.
 */
export const StatExplainer: React.FC<StatExplainerProps> = ({ content, children }) => {
  const { heading, intro, rows, steps, hint } = content;
  const columnCount = rows?.[0]?.cells.length ?? 0;

  const body = (
    <div className='StatExplainer'>
      <span className='StatExplainerHeading'>{heading}</span>
      {intro && <span className='StatExplainerIntro'>{intro}</span>}

      {rows && columnCount > 0 && (
        <div
          className='StatExplainerTable'
          style={{ gridTemplateColumns: `auto repeat(${columnCount}, minmax(1.1rem, auto))` }}
        >
          {rows.map((row) => (
            <Fragment key={row.label}>
              <span className='StatExplainerRowLabel'>{row.label}</span>
              {row.cells.map((cell, index) => (
                <span key={`${row.label}-${index}`}>{cell}</span>
              ))}
            </Fragment>
          ))}
        </div>
      )}

      {steps && steps.length > 0 && (
        <ol className='StatExplainerSteps'>
          {steps.map((step) => (
            <li key={step.label}>
              {step.label} <span className='StatExplainerCalc'>{step.calc}</span>
            </li>
          ))}
        </ol>
      )}

      {hint && <span className='StatExplainerHint'>{hint}</span>}
    </div>
  );

  return (
    <Tooltip
      title={body}
      placement='top'
      arrow
      enterTouchDelay={0}
      leaveTouchDelay={8000}
      slotProps={{ tooltip: { className: 'StatExplainerTooltip' } }}
    >
      {children}
    </Tooltip>
  );
};
