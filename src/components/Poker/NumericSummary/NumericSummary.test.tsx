import { render, screen, within } from '@testing-library/react';
import { fibonacciCards } from '../../Players/CardPicker/CardConfigs';
import { getNumericSummary, NumericSummaryResult } from '../../../service/statistics';
import { Game, GameType } from '../../../types/game';
import { Player } from '../../../types/player';
import { Status } from '../../../types/status';
import { NumericSummary } from './NumericSummary';

describe('NumericSummary component', () => {
  const mockGame: Game = {
    id: 'xyz',
    name: 'testGame',
    cards: fibonacciCards,
    gameType: GameType.Fibonacci,
    createdBy: 'someone',
    createdAt: new Date(),
    createdById: 'abc',
    gameStatus: Status.Finished,
  };

  const buildSummary = (players: Player[]): NumericSummaryResult => {
    const summary = getNumericSummary(mockGame, players);
    if (!summary) {
      throw new Error('expected a summary for the mocked game');
    }
    return summary;
  };

  it('should display average, nearest card, median and range', () => {
    const summary = buildSummary([
      { id: 'a1', name: 'SpiderMan', status: Status.Finished, value: 5 },
      { id: 'a2', name: 'IronMan', status: Status.Finished, value: 8 },
      { id: 'a3', name: 'Hulk', status: Status.Finished, value: 13 },
    ]);

    render(<NumericSummary summary={summary} />);

    const average = within(screen.getByTestId('summary-average'));
    const median = within(screen.getByTestId('summary-median'));

    expect(average.getByText('8.7')).toBeInTheDocument();
    expect(average.getByText('Nearest card: 8')).toBeInTheDocument();
    expect(median.getByText('8')).toBeInTheDocument();
    expect(median.getByText('Range: 5 – 13')).toBeInTheDocument();
  });

  it('should display the consensus status', () => {
    const summary = buildSummary([
      { id: 'a1', name: 'SpiderMan', status: Status.Finished, value: 2 },
      { id: 'a2', name: 'IronMan', status: Status.Finished, value: 5 },
      { id: 'a3', name: 'Hulk', status: Status.Finished, value: 34 },
    ]);

    render(<NumericSummary summary={summary} />);

    expect(screen.getByText('CRITICAL SPREAD')).toBeInTheDocument();
    expect(screen.getByText('Discussion required!')).toBeInTheDocument();
  });

  it('should display the distribution including players without an estimate', () => {
    const summary = buildSummary([
      { id: 'a1', name: 'SpiderMan', status: Status.Finished, value: 5 },
      { id: 'a2', name: 'IronMan', status: Status.Finished, value: 5 },
      { id: 'a3', name: 'Hulk', status: Status.Finished, value: -1 },
    ]);

    render(<NumericSummary summary={summary} />);

    expect(screen.getByText('Distribution: 2 votes, 1 without estimate')).toBeInTheDocument();
    expect(screen.getByTitle('2 votes for 5')).toBeInTheDocument();
  });

  it('should use the singular for a single vote', () => {
    const summary = buildSummary([
      { id: 'a1', name: 'SpiderMan', status: Status.Finished, value: 5 },
    ]);

    render(<NumericSummary summary={summary} />);

    expect(screen.getByText('Distribution: 1 vote')).toBeInTheDocument();
    expect(screen.getByTitle('1 vote for 5')).toBeInTheDocument();
  });

  it('should name the outliers', () => {
    const summary = buildSummary([
      { id: 'a1', name: 'SpiderMan', status: Status.Finished, value: 5 },
      { id: 'a2', name: 'IronMan', status: Status.Finished, value: 5 },
      { id: 'a3', name: 'Hulk', status: Status.Finished, value: 8 },
      { id: 'a4', name: 'Thor', status: Status.Finished, value: 55 },
    ]);

    render(<NumericSummary summary={summary} />);

    expect(screen.getByText('Outliers: Thor (55)')).toBeInTheDocument();
  });
});
