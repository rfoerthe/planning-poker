import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { startTimer, stopTimer } from '../../../service/games';
import { Game, GameType } from '../../../types/game';
import { Status } from '../../../types/status';
import { GameTimer } from './GameTimer';

vi.mock('../../../service/games', () => ({
  startTimer: vi.fn(),
  stopTimer: vi.fn(),
}));

describe('GameTimer component', () => {
  const buildGame = (overrides: Partial<Game> = {}): Game => ({
    id: 'game-1',
    name: 'testGame',
    gameStatus: Status.InProgress,
    gameType: GameType.Fibonacci,
    cards: [],
    createdBy: 'someone',
    createdById: 'abc',
    createdAt: new Date(),
    ...overrides,
  });

  it('should let a moderator pick one of the offered durations', async () => {
    render(<GameTimer game={buildGame()} canManageTimer={true} />);

    await userEvent.click(screen.getByTestId('timer-button'));

    ['0:30', '1:00', '1:30', '2:00', '3:00', '5:00'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('timer-duration-90'));

    expect(startTimer).toHaveBeenCalledWith('game-1', 90);
  });

  it('should show the remaining time while the timer runs', () => {
    render(<GameTimer game={buildGame()} remainingMs={95000} canManageTimer={true} />);

    expect(screen.getByTestId('timer-value')).toHaveTextContent('1:35');
    expect(screen.getByRole('timer')).toBeInTheDocument();
  });

  it('should stop a running timer instead of opening the menu', async () => {
    render(<GameTimer game={buildGame()} remainingMs={95000} canManageTimer={true} />);

    await userEvent.click(screen.getByTestId('timer-button'));

    expect(stopTimer).toHaveBeenCalledWith('game-1');
    expect(screen.queryByTestId('timer-duration-90')).not.toBeInTheDocument();
  });

  it('should not offer a timer once the votes are revealed', () => {
    render(<GameTimer game={buildGame({ gameStatus: Status.Finished })} canManageTimer={true} />);

    expect(screen.getByTestId('timer-button')).toBeDisabled();
  });

  it('should hide the control from participants while no timer runs', () => {
    const { container } = render(<GameTimer game={buildGame()} canManageTimer={false} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should show a running timer to participants without controls', () => {
    render(<GameTimer game={buildGame()} remainingMs={30000} canManageTimer={false} />);

    expect(screen.getByTestId('timer-value')).toHaveTextContent('0:30');
    expect(screen.queryByTestId('timer-button')).not.toBeInTheDocument();
  });
});
