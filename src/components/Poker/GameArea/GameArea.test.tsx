import { render, screen, within } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router';
import { Game, GameType } from '../../../types/game';
import { Player } from '../../../types/player';
import { Status } from '../../../types/status';
import { getCards } from '../../Players/CardPicker/CardConfigs';
import { GameArea } from './GameArea';

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
    average: 0,
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

    expect(screen.queryAllByText('1')).toHaveLength(3);
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

    expect(summary.getByText('T-Shirt Result')).toBeInTheDocument();
    expect(summary.getByText('Median range')).toBeInTheDocument();
    expect(summary.getByText('21-50 PD')).toBeInTheDocument();
    expect(summary.getByText('Total median value')).toBeInTheDocument();
    expect(summary.getByText('35.5 PD')).toBeInTheDocument();
    expect(summary.getByText('Consensus status')).toBeInTheDocument();
    expect(summary.getByText('MODERATE SPREAD')).toBeInTheDocument();
    expect(summary.getByText('Short clarification recommended.')).toBeInTheDocument();
    expect(summary.getByText('Spread: 2 | σ: 0.8 | Ratio: 9.1x')).toBeInTheDocument();
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
    expect(summary.getByText('1-300 PD')).toBeInTheDocument();
    expect(summary.getByText('CRITICAL SPREAD')).toBeInTheDocument();
    expect(summary.getByText('Discussion required!')).toBeInTheDocument();
    expect(summary.getByText('Spread: 5 | σ: 2.5 | Ratio: 300x')).toBeInTheDocument();
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
