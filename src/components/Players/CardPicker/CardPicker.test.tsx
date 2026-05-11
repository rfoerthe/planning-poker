import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Game, GameType } from '../../../types/game';
import { Player } from '../../../types/player';
import { Status } from '../../../types/status';
import { getCards } from './CardConfigs';
import { CardPicker } from './CardPicker';

describe('CardPicker component', () => {
  const mockGame: Game = {
    id: 'xyz',
    name: 'testGame',
    createdBy: 'someone',
    createdAt: new Date(),
    cards: [
      { value: 1, displayValue: '1', color: 'red' },
      { value: 2, displayValue: '2', color: 'blue' },
      { value: 3, displayValue: 'xl', color: 'green' },
    ],
    gameType: GameType.Fibonacci,
    average: 0,
    createdById: 'abc',
    gameStatus: Status.InProgress,
  };
  const mockPlayers: Player[] = [
    { id: 'a1', name: 'SpiderMan', status: Status.InProgress, value: 0 },
    { id: 'a2', name: 'IronMan', status: Status.Finished, value: 3 },
  ];
  const currentPlayerId = mockPlayers[0].id;
  it('should display correct card values', () => {
    const view = render(
      <CardPicker
        game={{ ...mockGame, cards: getCards(GameType.Fibonacci) }}
        players={mockPlayers}
        currentPlayerId={currentPlayerId}
      />,
    );

    getCards(GameType.Fibonacci)
      .filter((a) => a.value >= 0)
      .forEach((card) => {
        const cardElement = view.container.querySelector(`#card-${card.displayValue}`);
        expect(cardElement).toBeInTheDocument();
        const cardValueElement = screen.queryAllByText(card.value);
        expect(cardValueElement.length).toBeGreaterThan(0);
      });
  });
  it('should display correct card values for ShortFibonacci game type', () => {
    const view = render(
      <CardPicker
        game={{
          ...mockGame,
          cards: getCards(GameType.ShortFibonacci),
          gameType: GameType.ShortFibonacci,
        }}
        players={mockPlayers}
        currentPlayerId={currentPlayerId}
      />,
    );

    getCards(GameType.ShortFibonacci)
      .filter((a) => a.value >= 0)
      .forEach((card) => {
        const cardElement = view.container.querySelector(`#card-${card.displayValue}`);
        expect(cardElement).toBeInTheDocument();
        const cardValueElement = screen.queryAllByText(card.displayValue);
        expect(cardValueElement.length).toBeGreaterThan(0);
      });
  });
  it('should display correct card values TShirt game type', () => {
    const view = render(
      <CardPicker
        game={{ ...mockGame, cards: getCards(GameType.TShirt), gameType: GameType.TShirt }}
        players={mockPlayers}
        currentPlayerId={currentPlayerId}
      />,
    );

    getCards(GameType.TShirt)
      .filter((a) => a.value >= 0)
      .forEach((card) => {
        const cardElement = view.container.querySelector(`#card-${card.displayValue}`);
        expect(cardElement).toBeInTheDocument();
        const cardValueElement = screen.queryAllByText(card.displayValue);
        expect(cardValueElement.length).toBeGreaterThan(0);
      });
  });
  it('should display correct card values TShirt & Numbers game type', () => {
    const view = render(
      <CardPicker
        game={{
          ...mockGame,
          cards: getCards(GameType.TShirtAndNumber),
          gameType: GameType.TShirtAndNumber,
        }}
        players={mockPlayers}
        currentPlayerId={currentPlayerId}
      />,
    );

    getCards(GameType.TShirtAndNumber)
      .filter((a) => a.value >= 0)
      .forEach((card) => {
        const cardElement = view.container.querySelector(`#card-${card.displayValue}`);
        expect(cardElement).toBeInTheDocument();
        const cardValueElement = screen.queryAllByText(card.displayValue);
        expect(cardValueElement.length).toBeGreaterThan(0);
      });
  });
  it('should display correct card values for Custom type', () => {
    const view = render(
      <CardPicker
        game={{
          ...mockGame,

          gameType: GameType.TShirtAndNumber,
        }}
        players={mockPlayers}
        currentPlayerId={currentPlayerId}
      />,
    );

    mockGame.cards
      .filter((a) => a.value >= 0)
      .forEach((card) => {
        const cardElement = view.container.querySelector(`#card-${card.displayValue}`);
        expect(cardElement).toBeInTheDocument();
        const cardValueElement = screen.queryAllByText(card.displayValue);
        expect(cardValueElement.length).toBeGreaterThan(0);
      });
  });
  it('should report a selected card when player clicks on a card', async () => {
    const currentPlayerId = mockPlayers[0].id;
    const onCardPick = vi.fn();
    render(
      <CardPicker
        game={mockGame}
        players={mockPlayers}
        currentPlayerId={currentPlayerId}
        onCardPick={onCardPick}
      />,
    );
    const cardValueElement = screen.queryAllByText(1);
    const cardButton = cardValueElement[0].closest('button');
    expect(cardButton).toBeInTheDocument();
    await userEvent.click(cardButton as HTMLButtonElement);
    expect(onCardPick).toHaveBeenCalledWith(expect.objectContaining({ value: 1 }));
  });

  it('should report every selected card while cards are changed quickly', async () => {
    const currentPlayerId = mockPlayers[0].id;
    const onCardPick = vi.fn();
    render(
      <CardPicker
        game={mockGame}
        players={mockPlayers}
        currentPlayerId={currentPlayerId}
        onCardPick={onCardPick}
      />,
    );
    const oneButton = screen.queryAllByText(1)[0].closest('button');
    const twoButton = screen.queryAllByText(2)[0].closest('button');
    const threeButton = screen.queryAllByText('xl')[0].closest('button');

    expect(oneButton).toBeInTheDocument();
    expect(twoButton).toBeInTheDocument();
    expect(threeButton).toBeInTheDocument();

    await userEvent.click(oneButton as HTMLButtonElement);
    await userEvent.click(twoButton as HTMLButtonElement);
    await userEvent.click(threeButton as HTMLButtonElement);

    expect(onCardPick).toHaveBeenCalledTimes(3);
    expect(onCardPick).toHaveBeenLastCalledWith(expect.objectContaining({ value: 3 }));
  });

  it('should not update player value when player clicks on a card and game is finished', async () => {
    const currentPlayerId = mockPlayers[0].id;
    const onCardPick = vi.fn();
    const finishedGameMock = {
      ...mockGame,
      gameStatus: Status.Finished,
    };
    render(
      <CardPicker
        game={finishedGameMock}
        players={mockPlayers}
        currentPlayerId={currentPlayerId}
        onCardPick={onCardPick}
      />,
    );
    const cardValueElement = screen.queryAllByText(1);
    const cardButton = cardValueElement[0].closest('button');
    expect(cardButton).toBeInTheDocument();
    await userEvent.click(cardButton as HTMLButtonElement);
    expect(onCardPick).toHaveBeenCalledTimes(0);
  });
  it('should use the same disabled card background when game is finished', () => {
    const finishedGameMock = {
      ...mockGame,
      gameStatus: Status.Finished,
      cards: getCards(GameType.TShirt),
      gameType: GameType.TShirt,
    };
    const view = render(
      <CardPicker
        game={finishedGameMock}
        players={mockPlayers}
        currentPlayerId={currentPlayerId}
      />,
    );

    getCards(GameType.TShirt).forEach((card) => {
      const cardElement = view.container.querySelector(`#card-${card.displayValue}`);
      expect(cardElement).toHaveStyle({
        backgroundColor: 'var(--color-background-secondary)',
      });
    });
  });
  it('should display Click on the card to vote when game is not finished', () => {
    const currentPlayerId = mockPlayers[0].id;

    render(<CardPicker game={mockGame} players={mockPlayers} currentPlayerId={currentPlayerId} />);
    const helperText = screen.getByText('Click on the card to vote');

    expect(helperText).toBeInTheDocument();
  });
  it('should display wait message to vote when game is finished', () => {
    const currentPlayerId = mockPlayers[0].id;
    const finishedGameMock = {
      ...mockGame,
      gameStatus: Status.Finished,
    };
    render(
      <CardPicker
        game={finishedGameMock}
        players={mockPlayers}
        currentPlayerId={currentPlayerId}
      />,
    );
    const helperText = screen.getByText(
      'Session not ready for Voting! Wait for moderator to press "Restart" button to start voting.',
    );

    expect(helperText).toBeInTheDocument();
  });
});
