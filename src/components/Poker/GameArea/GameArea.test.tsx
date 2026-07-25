import { act, render, screen, within } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router';
import { vi } from 'vitest';
import { finishGame, stopTimer } from '../../../service/games';
import { presenceHeartbeatMs, presenceTimeoutMs } from '../../../service/presence';
import { Game, GameType } from '../../../types/game';
import { Player } from '../../../types/player';
import { Status } from '../../../types/status';
import { getCards } from '../../Players/CardPicker/CardConfigs';
import { GameArea } from './GameArea';

vi.mock('../../../service/games', () => ({
  finishGame: vi.fn(),
  stopTimer: vi.fn(),
  removeGame: vi.fn(),
  resetGame: vi.fn(),
  startTimer: vi.fn(),
}));
vi.mock('../../../service/presence', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../service/presence')>();
  return { ...actual, updatePresence: vi.fn() };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('GameArea component', () => {
  const mockGame: Game = {
    id: 'xyz',
    name: 'testGame',
    cards: [
      { value: 1, displayValue: '1', color: 'red' },
      { value: 2, displayValue: '2', color: 'blue' },
      { value: 3, displayValue: '3', color: 'green' },
    ],
    createdBy: 'someone',
    createdAt: new Date(),
    createdById: 'abc',
    gameStatus: Status.InProgress,
  };
  const mockPlayers: Player[] = [
    { id: 'a1', name: 'SpiderMan', status: Status.InProgress, value: 0 },
    { id: 'a2', name: 'IronMan', status: Status.Finished, value: 3 },
  ];
  const mockCurrentPlayerId = mockPlayers[0].id;
  it('should display players', () => {
    renderWithRouter(
      <GameArea game={mockGame} players={mockPlayers} currentPlayerId={mockCurrentPlayerId} />,
    );

    mockPlayers.forEach((player: Player) => {
      expect(screen.getByText(player.name)).toBeInTheDocument();
    });
  });

  it('should display game controller with name', () => {
    renderWithRouter(
      <GameArea game={mockGame} players={mockPlayers} currentPlayerId={mockCurrentPlayerId} />,
    );
    expect(screen.getByText(mockGame.name)).toBeInTheDocument();
  });
  it('should display card picker', () => {
    renderWithRouter(
      <GameArea game={mockGame} players={mockPlayers} currentPlayerId={mockCurrentPlayerId} />,
    );

    expect(within(screen.getByTestId('card-picker')).queryAllByText('1')).toHaveLength(2);
  });

  it('should display T-Shirt median summary when the game is finished', () => {
    const tShirtGame = {
      ...mockGame,
      gameType: GameType.TShirt,
      cards: getCards(GameType.TShirt),
      gameStatus: Status.Finished,
    };
    const tShirtPlayers: Player[] = [
      { id: 'a1', name: 'SpiderMan', status: Status.Finished, value: 30 },
      { id: 'a2', name: 'IronMan', status: Status.Finished, value: 40 },
      { id: 'a3', name: 'Hulk', status: Status.Finished, value: 50 },
    ];

    renderWithRouter(
      <GameArea game={tShirtGame} players={tShirtPlayers} currentPlayerId={mockCurrentPlayerId} />,
    );

    const summary = within(screen.getByTestId('tshirt-summary'));

    expect(summary.getByText('T-Shirt-Ergebnis')).toBeInTheDocument();
    expect(summary.getByText('Median-Größe')).toBeInTheDocument();
    expect(summary.getByText('21-50 PT')).toBeInTheDocument();
    expect(summary.getByText('Median-Aufwand')).toBeInTheDocument();
    expect(summary.getByText('35,5 PT')).toBeInTheDocument();
    expect(summary.getByText('Mittlere Streuung')).toBeInTheDocument();
    expect(summary.getByText('Kurze Klärung empfohlen.')).toBeInTheDocument();
    expect(summary.getByText('Spanne: 2 · σ: 0,8 · Verhältnis: 9,1×')).toBeInTheDocument();
  });

  it('should display a critical T-Shirt consensus status for extreme spreads', () => {
    const tShirtGame = {
      ...mockGame,
      gameType: GameType.TShirt,
      cards: getCards(GameType.TShirt),
      gameStatus: Status.Finished,
    };
    const tShirtPlayers: Player[] = [
      { id: 'a1', name: 'Sepp', status: Status.Finished, value: 10 },
      { id: 'a2', name: 'Lisa Marie', status: Status.Finished, value: 60 },
    ];

    renderWithRouter(
      <GameArea game={tShirtGame} players={tShirtPlayers} currentPlayerId={mockCurrentPlayerId} />,
    );

    const summary = within(screen.getByTestId('tshirt-summary'));

    expect(summary.getByText('XXS-XL')).toBeInTheDocument();
    expect(summary.getByText('1-300 PT')).toBeInTheDocument();
    expect(summary.getByText('Kritische Streuung')).toBeInTheDocument();
    expect(summary.getByText('Diskussion erforderlich!')).toBeInTheDocument();
    expect(summary.getByText('Spanne: 5 · σ: 2,5 · Verhältnis: 300×')).toBeInTheDocument();
  });

  describe('presence indicators', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const buildPlayers = (): Player[] => [
      { id: 'a1', name: 'Anna', status: Status.NotStarted, lastSeenAt: new Date() },
      { id: 'a2', name: 'Ben', status: Status.NotStarted, lastSeenAt: new Date() },
      { id: 'a3', name: 'Ghost', status: Status.NotStarted },
    ];

    it('should mark participants that are refreshing and skip leftovers', () => {
      renderWithRouter(
        <GameArea game={mockGame} players={buildPlayers()} currentPlayerId='a1' />,
      );

      expect(screen.getAllByTestId('presence-indicator')).toHaveLength(2);
    });

    it('should drop a participant that stopped refreshing, without new data', () => {
      renderWithRouter(
        <GameArea game={mockGame} players={buildPlayers()} currentPlayerId='a1' />,
      );

      act(() => {
        vi.advanceTimersByTime(presenceTimeoutMs + presenceHeartbeatMs);
      });

      // Only the own card remains: it counts as active regardless of timestamps.
      expect(screen.getAllByTestId('presence-indicator')).toHaveLength(1);
    });
  });

  describe('expired round timer', () => {
    const expiredGame = (): Game => ({
      ...mockGame,
      gameStatus: Status.InProgress,
      timerEndsAt: new Date(Date.now() - 1000),
    });

    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should reveal the round even when older participants are gone', () => {
      // The reported failure: the participant who voted is the only one still
      // present, while the earlier entries belong to closed browsers.
      const players: Player[] = [
        { id: 'a1', name: 'Ghost', status: Status.NotStarted, value: -3 },
        { id: 'a2', name: 'Ghost Two', status: Status.NotStarted, value: -3 },
        { id: 'a3', name: 'Anna', status: Status.Finished, value: 3 },
      ];

      renderWithRouter(<GameArea game={expiredGame()} players={players} currentPlayerId='a3' />);

      act(() => {
        vi.advanceTimersByTime(50);
      });

      expect(finishGame).toHaveBeenCalledWith(mockGame.id);
    });

    it('should let an idle participant take over after its turn', () => {
      const players: Player[] = [
        { id: 'a1', name: 'Ghost', status: Status.NotStarted, value: -3 },
        { id: 'a2', name: 'Still Here', status: Status.NotStarted, value: -3 },
      ];

      renderWithRouter(<GameArea game={expiredGame()} players={players} currentPlayerId='a2' />);

      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(finishGame).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(400);
      });
      expect(finishGame).toHaveBeenCalledWith(mockGame.id);
    });

    it('should not act again once the round is revealed', () => {
      const players: Player[] = [{ id: 'a1', name: 'Anna', status: Status.Finished, value: 3 }];

      renderWithRouter(
        <GameArea
          game={{ ...expiredGame(), gameStatus: Status.Finished }}
          players={players}
          currentPlayerId='a1'
        />,
      );

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(finishGame).not.toHaveBeenCalled();
    });

    it('should only stop the timer when nobody voted', () => {
      const players: Player[] = [{ id: 'a1', name: 'Anna', status: Status.NotStarted, value: -3 }];

      renderWithRouter(
        <GameArea
          game={{ ...expiredGame(), gameStatus: Status.Started }}
          players={players}
          currentPlayerId='a1'
        />,
      );

      act(() => {
        vi.advanceTimersByTime(50);
      });

      expect(stopTimer).toHaveBeenCalledWith(mockGame.id);
      expect(finishGame).not.toHaveBeenCalled();
    });

    it('should not act while the timer is still running', () => {
      const players: Player[] = [{ id: 'a1', name: 'Anna', status: Status.Finished, value: 3 }];

      renderWithRouter(
        <GameArea
          game={{ ...mockGame, timerEndsAt: new Date(Date.now() + 30000) }}
          players={players}
          currentPlayerId='a1'
        />,
      );

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(finishGame).not.toHaveBeenCalled();
      expect(stopTimer).not.toHaveBeenCalled();
    });
  });

  it('should not display T-Shirt median summary before the game is finished', () => {
    renderWithRouter(
      <GameArea
        game={{ ...mockGame, gameType: GameType.TShirt, cards: getCards(GameType.TShirt) }}
        players={mockPlayers}
        currentPlayerId={mockCurrentPlayerId}
      />,
    );

    expect(screen.queryByText('T-Shirt Result')).not.toBeInTheDocument();
  });
});
