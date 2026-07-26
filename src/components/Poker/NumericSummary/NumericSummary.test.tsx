import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  const openExplanation = async (testId: string) => {
    await userEvent.hover(screen.getByTestId(testId));
    return within(await screen.findByRole('tooltip'));
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

    expect(average.getByText('8,7')).toBeInTheDocument();
    expect(screen.getByText(/Empfehlung: 8/)).toBeInTheDocument();
    expect(median.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('5–13')).toBeInTheDocument();
  });

  it('should display the consensus status', () => {
    const summary = buildSummary([
      { id: 'a1', name: 'SpiderMan', status: Status.Finished, value: 2 },
      { id: 'a2', name: 'IronMan', status: Status.Finished, value: 5 },
      { id: 'a3', name: 'Hulk', status: Status.Finished, value: 34 },
    ]);

    render(<NumericSummary summary={summary} />);

    expect(screen.getByText('Kritische Streuung')).toBeInTheDocument();
    expect(screen.getByText('Diskussion erforderlich!')).toBeInTheDocument();
  });

  it('should display the distribution including players without an estimate', () => {
    const summary = buildSummary([
      { id: 'a1', name: 'SpiderMan', status: Status.Finished, value: 5 },
      { id: 'a2', name: 'IronMan', status: Status.Finished, value: 5 },
      { id: 'a3', name: 'Hulk', status: Status.Finished, value: -1 },
    ]);

    render(<NumericSummary summary={summary} />);

    expect(screen.getByText('Verteilung: 2 Stimmen, 1 ohne Schätzung')).toBeInTheDocument();
    expect(screen.getByTitle('2 Stimmen für 5')).toBeInTheDocument();
  });

  it('should use the singular for a single vote', () => {
    const summary = buildSummary([
      { id: 'a1', name: 'SpiderMan', status: Status.Finished, value: 5 },
    ]);

    render(<NumericSummary summary={summary} />);

    expect(screen.getByText('Verteilung: 1 Stimme')).toBeInTheDocument();
    expect(screen.getByTitle('1 Stimme für 5')).toBeInTheDocument();
  });

  it('should explain the median of an odd number of votes', async () => {
    const summary = buildSummary([
      { id: 'a1', name: 'SpiderMan', status: Status.Finished, value: 1 },
      { id: 'a2', name: 'IronMan', status: Status.Finished, value: 8 },
      { id: 'a3', name: 'Hulk', status: Status.Finished, value: 55 },
    ]);

    render(<NumericSummary summary={summary} />);

    await userEvent.hover(screen.getByTestId('summary-median'));

    const tooltip = within(await screen.findByRole('tooltip'));

    expect(tooltip.getByText(/Der Median ist die mittlere Stimme/)).toBeInTheDocument();
    expect(tooltip.getByText('1 · 8 · 55')).toBeInTheDocument();
    expect(tooltip.getByText('Mittlere Stimme nehmen (2. von 3):')).toBeInTheDocument();
    expect(tooltip.getByText(/Empfehlung darunter geht dagegen vom Durchschnitt aus/)).toBeInTheDocument();
  });

  it('should average the two middle votes when there is no single middle', async () => {
    const summary = buildSummary([
      { id: 'a1', name: 'SpiderMan', status: Status.Finished, value: 3 },
      { id: 'a2', name: 'IronMan', status: Status.Finished, value: 5 },
      { id: 'a3', name: 'Hulk', status: Status.Finished, value: 8 },
      { id: 'a4', name: 'Thor', status: Status.Finished, value: 13 },
    ]);

    render(<NumericSummary summary={summary} />);

    await userEvent.hover(screen.getByTestId('summary-median'));

    const tooltip = within(await screen.findByRole('tooltip'));

    expect(tooltip.getByText('3 · 5 · 8 · 13')).toBeInTheDocument();
    expect(
      tooltip.getByText('Mittelwert der beiden mittleren Stimmen (2. und 3. von 4):'),
    ).toBeInTheDocument();
    expect(tooltip.getByText('(5 + 8) ÷ 2 = 6,5')).toBeInTheDocument();
  });

  it('should label the deviation with the scale it counts', () => {
    const summary = buildSummary([
      { id: 'a1', name: 'SpiderMan', status: Status.Finished, value: 5 },
      { id: 'a2', name: 'IronMan', status: Status.Finished, value: 8 },
      { id: 'a3', name: 'Hulk', status: Status.Finished, value: 13 },
    ]);

    render(<NumericSummary summary={summary} />);

    const deviation = within(screen.getByTestId('summary-deviation'));

    expect(deviation.getByText('Kartenschritte')).toBeInTheDocument();
    expect(deviation.getByText('0,8')).toBeInTheDocument();
  });

  it('should explain the deviation with the votes of this round on hover', async () => {
    const summary = buildSummary([
      { id: 'a1', name: 'SpiderMan', status: Status.Finished, value: 5 },
      { id: 'a2', name: 'IronMan', status: Status.Finished, value: 8 },
      { id: 'a3', name: 'Hulk', status: Status.Finished, value: 13 },
    ]);

    render(<NumericSummary summary={summary} />);

    await userEvent.hover(screen.getByTestId('summary-deviation'));

    const tooltip = within(await screen.findByRole('tooltip'));

    expect(tooltip.getByText('Streuung über die Kartenpositionen')).toBeInTheDocument();
    // The votes sit on positions 4, 5 and 6 of the Fibonacci deck.
    expect(tooltip.getByText('(4 + 5 + 6) ÷ 3 = 5')).toBeInTheDocument();
    expect(tooltip.getByText('-1 · 0 · 1')).toBeInTheDocument();
    expect(tooltip.getByText('(1² + 0² + 1²) ÷ 3 = 0,67')).toBeInTheDocument();
    expect(tooltip.getByText('σ = √0,67 = 0,8')).toBeInTheDocument();
  });

  it('should explain the spread of the verdict line', async () => {
    const summary = buildSummary([
      { id: 'a1', name: 'SpiderMan', status: Status.Finished, value: 1 },
      { id: 'a2', name: 'IronMan', status: Status.Finished, value: 8 },
      { id: 'a3', name: 'Hulk', status: Status.Finished, value: 55 },
    ]);

    render(<NumericSummary summary={summary} />);

    await userEvent.hover(screen.getByTestId('verdict-spread'));

    const tooltip = within(await screen.findByRole('tooltip'));

    // Positions 1, 5 and 9 of the Fibonacci deck.
    expect(tooltip.getByText('1 → 1 · 55 → 9')).toBeInTheDocument();
    expect(tooltip.getByText('9 − 1 = 8')).toBeInTheDocument();
  });

  it('should explain the ratio of the verdict line', async () => {
    const summary = buildSummary([
      { id: 'a1', name: 'SpiderMan', status: Status.Finished, value: 2 },
      { id: 'a2', name: 'IronMan', status: Status.Finished, value: 8 },
      { id: 'a3', name: 'Hulk', status: Status.Finished, value: 34 },
    ]);

    render(<NumericSummary summary={summary} />);

    await userEvent.hover(screen.getByTestId('verdict-ratio'));

    const tooltip = within(await screen.findByRole('tooltip'));

    expect(tooltip.getByText('34 ÷ 2 = 17')).toBeInTheDocument();
  });

  it('should reuse the deviation explanation in the verdict line', async () => {
    const summary = buildSummary([
      { id: 'a1', name: 'SpiderMan', status: Status.Finished, value: 5 },
      { id: 'a2', name: 'IronMan', status: Status.Finished, value: 8 },
      { id: 'a3', name: 'Hulk', status: Status.Finished, value: 13 },
    ]);

    render(<NumericSummary summary={summary} />);

    await userEvent.hover(screen.getByTestId('verdict-deviation'));

    const tooltip = within(await screen.findByRole('tooltip'));

    expect(tooltip.getByText('σ = √0,67 = 0,8')).toBeInTheDocument();
  });

  it('should explain which rule made the round critical', async () => {
    // Positions 1, 5 and 9 — both the spread and the deviation are over the line.
    const summary = buildSummary([
      { id: 'a1', name: 'SpiderMan', status: Status.Finished, value: 1 },
      { id: 'a2', name: 'IronMan', status: Status.Finished, value: 8 },
      { id: 'a3', name: 'Hulk', status: Status.Finished, value: 55 },
    ]);

    render(<NumericSummary summary={summary} />);

    const tooltip = await openExplanation('verdict-status');

    expect(tooltip.getByText('8 Schritte — kritisch ab 3')).toBeInTheDocument();
    expect(tooltip.getByText('3,3 — kritisch über 1,5')).toBeInTheDocument();
    expect(tooltip.getByText('Beide Grenzen überschritten → kritische Streuung')).toBeInTheDocument();
  });

  it('should say that the deviation rule needs a third vote', async () => {
    // Two votes one position apart: consensus, and the deviation does not count.
    const summary = buildSummary([
      { id: 'a1', name: 'SpiderMan', status: Status.Finished, value: 5 },
      { id: 'a2', name: 'IronMan', status: Status.Finished, value: 8 },
    ]);

    render(<NumericSummary summary={summary} />);

    const tooltip = await openExplanation('verdict-status');

    expect(tooltip.getByText('1 Schritt — kritisch ab 3')).toBeInTheDocument();
    expect(tooltip.getByText('0,5 — zählt erst ab 3 Stimmen')).toBeInTheDocument();
    expect(tooltip.getByText('Keine Grenze überschritten → Konsens')).toBeInTheDocument();
  });

  it('should explain the average', async () => {
    const summary = buildSummary([
      { id: 'a1', name: 'SpiderMan', status: Status.Finished, value: 1 },
      { id: 'a2', name: 'IronMan', status: Status.Finished, value: 8 },
      { id: 'a3', name: 'Hulk', status: Status.Finished, value: 55 },
    ]);

    render(<NumericSummary summary={summary} />);

    const tooltip = await openExplanation('summary-average');

    expect(tooltip.getByText('(1 + 8 + 55) ÷ 3 = 21,3')).toBeInTheDocument();
  });

  it('should explain the recommendation against its neighbouring card', async () => {
    // The average of 21,3 sits between 21 and 34.
    const summary = buildSummary([
      { id: 'a1', name: 'SpiderMan', status: Status.Finished, value: 1 },
      { id: 'a2', name: 'IronMan', status: Status.Finished, value: 8 },
      { id: 'a3', name: 'Hulk', status: Status.Finished, value: 55 },
    ]);

    render(<NumericSummary summary={summary} />);

    const tooltip = await openExplanation('summary-recommendation');

    expect(tooltip.getByText('21 → 0,3 · 34 → 12,7')).toBeInTheDocument();
  });

  it('should explain how the outliers were picked', async () => {
    const summary = buildSummary([
      { id: 'a1', name: 'SpiderMan', status: Status.Finished, value: 1 },
      { id: 'a2', name: 'IronMan', status: Status.Finished, value: 8 },
      { id: 'a3', name: 'Hulk', status: Status.Finished, value: 55 },
    ]);

    render(<NumericSummary summary={summary} />);

    const tooltip = await openExplanation('summary-outliers');

    expect(tooltip.getByText('Position der mittleren Stimme:')).toBeInTheDocument();
    expect(tooltip.getByText('1 → 4 · 8 → 0 · 55 → 4')).toBeInTheDocument();
    expect(tooltip.getByText('Ausreißer ab 2 Kartenschritten:')).toBeInTheDocument();
  });

  it('should name the outliers', () => {
    const summary = buildSummary([
      { id: 'a1', name: 'SpiderMan', status: Status.Finished, value: 5 },
      { id: 'a2', name: 'IronMan', status: Status.Finished, value: 5 },
      { id: 'a3', name: 'Hulk', status: Status.Finished, value: 8 },
      { id: 'a4', name: 'Thor', status: Status.Finished, value: 55 },
    ]);

    render(<NumericSummary summary={summary} />);

    expect(screen.getByText('Ausreißer: Thor (55)')).toBeInTheDocument();
  });
});
