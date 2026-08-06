import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getCards } from '../../Players/CardPicker/CardConfigs';
import { Game, GameType } from '../../../types/game';
import { Player } from '../../../types/player';
import { Status } from '../../../types/status';
import { TshirtSummary } from './TshirtSummary';

describe('TshirtSummary component', () => {
  const mockGame: Game = {
    id: 'xyz',
    name: 'testGame',
    cards: getCards(GameType.TShirt),
    gameType: GameType.TShirt,
    createdBy: 'someone',
    createdAt: new Date(),
    createdById: 'abc',
    gameStatus: Status.Finished,
  };

  /** Card values of the t-shirt deck: XXS 10, XS 20, S 30, M 40, L 50, XL 60. */
  const buildPlayers = (values: number[]): Player[] =>
    values.map((value, index) => ({
      id: `p${index}`,
      name: `Player ${index}`,
      status: Status.Finished,
      value,
    }));

  const openExplanation = async (testId: string) => {
    await userEvent.hover(screen.getByTestId(testId));
    return within(await screen.findByRole('tooltip'));
  };

  it('should explain the median size for an odd number of votes', async () => {
    // S, M, L — the middle vote is M.
    render(<TshirtSummary game={mockGame} players={buildPlayers([30, 40, 50])} />);

    expect(within(screen.getByTestId('tshirt-median-size')).getByText('M')).toBeInTheDocument();

    const tooltip = await openExplanation('tshirt-median-size');

    expect(tooltip.getByText(/Der Median ist die mittlere Stimme/)).toBeInTheDocument();
    expect(tooltip.getByText('S · M · L')).toBeInTheDocument();
    expect(tooltip.getByText('Mittlere Stimme nehmen (2. von 3):')).toBeInTheDocument();
  });

  it('should explain the median size across the two middle votes', async () => {
    // S, M, L, XL — the middle lands between M and L.
    render(<TshirtSummary game={mockGame} players={buildPlayers([30, 40, 50, 60])} />);

    const tooltip = await openExplanation('tshirt-median-size');

    expect(tooltip.getByText('S · M · L · XL')).toBeInTheDocument();
    expect(
      tooltip.getByText('Die beiden mittleren Stimmen nehmen (2. und 3. von 4):'),
    ).toBeInTheDocument();
    expect(tooltip.getByText('M · L → M-L')).toBeInTheDocument();
  });

  it('should explain the median effort from the range of the median size', async () => {
    // The median size M covers 21 to 50 person days.
    render(<TshirtSummary game={mockGame} players={buildPlayers([30, 40, 50])} />);

    expect(
      within(screen.getByTestId('tshirt-median-effort')).getByText('35,5 PT'),
    ).toBeInTheDocument();

    const tooltip = await openExplanation('tshirt-median-effort');

    expect(tooltip.getByText('Spanne der Median-Größe M:')).toBeInTheDocument();
    expect(tooltip.getByText('21–50 PT')).toBeInTheDocument();
    expect(tooltip.getByText('(21 + 50) ÷ 2 = 35,5 PT')).toBeInTheDocument();
  });

  it('should explain the ratio from the middle of both effort ranges', async () => {
    // S covers 11 to 20, XL covers 101 to 300.
    render(<TshirtSummary game={mockGame} players={buildPlayers([30, 40, 60])} />);

    const tooltip = await openExplanation('verdict-ratio');

    expect(tooltip.getByText('Aufwand der größten Stimme XL:')).toBeInTheDocument();
    expect(tooltip.getByText('(101 + 300) ÷ 2 = 200,5 PT')).toBeInTheDocument();
    expect(tooltip.getByText('(11 + 20) ÷ 2 = 15,5 PT')).toBeInTheDocument();
    expect(tooltip.getByText('200,5 ÷ 15,5 = 12,9')).toBeInTheDocument();
  });

  it('should explain the spread from the size steps', async () => {
    // S sits on step 3, XL on step 6.
    render(<TshirtSummary game={mockGame} players={buildPlayers([30, 40, 60])} />);

    const tooltip = await openExplanation('verdict-spread');

    expect(tooltip.getByText(/wie viele Größenstufen/)).toBeInTheDocument();
    expect(tooltip.getByText('S → 3 · XL → 6')).toBeInTheDocument();
    expect(tooltip.getByText('6 − 3 = 3')).toBeInTheDocument();
  });

  it('should average both ranges when the median lands between two sizes', async () => {
    // M covers 21 to 50, L covers 51 to 100.
    render(<TshirtSummary game={mockGame} players={buildPlayers([30, 40, 50, 60])} />);

    const tooltip = await openExplanation('tshirt-median-effort');

    expect(tooltip.getByText('(21 + 50) ÷ 2 = 35,5 · (51 + 100) ÷ 2 = 75,5')).toBeInTheDocument();
    expect(tooltip.getByText('(35,5 + 75,5) ÷ 2 = 55,5 PT')).toBeInTheDocument();
  });
});
