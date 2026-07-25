import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { vi } from 'vitest';
import { CreateGame } from './CreateGame';
import * as gamesService from '../../../service/games';

const mockNavigate = vi.fn();
vi.mock('../../../service/games');
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});
vi.mock('unique-names-generator', () => ({
  starWars: ['Jabba'],
  colors: ['red'],
  animals: ['kangaroo'],
  uniqueNamesGenerator: vi.fn(),
  Config: vi.fn(),
}));
describe('CreateGame component', () => {
  it('should display correct text fields', () => {
    render(<CreateGame />);

    expect(screen.getByPlaceholderText('z. B. Sprint 42 — Refinement')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Wie sollen dich die anderen sehen?')).toBeInTheDocument();
  });

  it('should display create button', () => {
    render(<CreateGame />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Session starten');
  });

  it('should empty inputs when clicked', async () => {
    render(<CreateGame />);
    const sessionName = screen.getByPlaceholderText('z. B. Sprint 42 — Refinement');
    const userName = screen.getByPlaceholderText('Wie sollen dich die anderen sehen?');
    await userEvent.click(sessionName);
    await userEvent.click(userName);

    expect(sessionName).toHaveValue('');
    expect(userName).toHaveValue('');
  });

  it('should be able to create new session', async () => {
    render(<CreateGame />);
    const sessionName = screen.getByPlaceholderText('z. B. Sprint 42 — Refinement');
    await userEvent.clear(sessionName);
    await userEvent.type(sessionName, 'Marvels');

    const userName = screen.getByPlaceholderText('Wie sollen dich die anderen sehen?');
    await userEvent.clear(userName);
    await userEvent.type(userName, 'Rock');

    const createButton = screen.getByText('Session starten');
    await userEvent.click(createButton);

    expect(gamesService.addNewGame).toHaveBeenCalled();

    expect(gamesService.addNewGame).toHaveBeenCalledWith(
      expect.objectContaining({
        createdBy: 'Rock',
        gameType: 'ShortFibonacci',
        name: 'Marvels',
        isAllowMembersToManageSession: true,
      }),
    );
  });
  it('should be able to create new session with Allow members to manage session', async () => {
    render(<CreateGame />);
    const sessionName = screen.getByPlaceholderText('z. B. Sprint 42 — Refinement');
    await userEvent.clear(sessionName);
    await userEvent.type(sessionName, 'Marvels');

    const userName = screen.getByPlaceholderText('Wie sollen dich die anderen sehen?');
    await userEvent.clear(userName);
    await userEvent.type(userName, 'Rock');

    const allowMembersToManageSession = screen.getByRole('switch');
    await userEvent.click(allowMembersToManageSession);

    const createButton = screen.getByText('Session starten');
    await userEvent.click(createButton);

    expect(gamesService.addNewGame).toHaveBeenCalled();

    expect(gamesService.addNewGame).toHaveBeenCalledWith(
      expect.objectContaining({
        createdBy: 'Rock',
        gameType: 'ShortFibonacci',
        name: 'Marvels',
        isAllowMembersToManageSession: false,
      }),
    );
  });
  it('should be able to create new session of TShirt Sizing', async () => {
    render(<CreateGame />);
    const sessionName = screen.getByPlaceholderText('z. B. Sprint 42 — Refinement');
    await userEvent.clear(sessionName);
    await userEvent.type(sessionName, 'Marvels');

    const userName = screen.getByPlaceholderText('Wie sollen dich die anderen sehen?');
    await userEvent.clear(userName);
    await userEvent.type(userName, 'Rock');

    const tShirt = screen.getByTestId('deck-option-TShirt');
    await userEvent.click(tShirt);

    const createButton = screen.getByText('Session starten');
    await userEvent.click(createButton);

    expect(gamesService.addNewGame).toHaveBeenCalled();

    expect(gamesService.addNewGame).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: 'Rock', gameType: 'TShirt', name: 'Marvels' }),
    );
  });
  it('should be able to create new session of Short Fibonacci Sizing', async () => {
    render(<CreateGame />);
    const sessionName = screen.getByPlaceholderText('z. B. Sprint 42 — Refinement');
    await userEvent.clear(sessionName);
    await userEvent.type(sessionName, 'Marvels');

    const userName = screen.getByPlaceholderText('Wie sollen dich die anderen sehen?');
    await userEvent.clear(userName);
    await userEvent.type(userName, 'Rock');

    const gameType = screen.getByTestId('deck-option-ShortFibonacci');
    await userEvent.click(gameType);

    const createButton = screen.getByText('Session starten');
    await userEvent.click(createButton);

    expect(gamesService.addNewGame).toHaveBeenCalled();

    expect(gamesService.addNewGame).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: 'Rock', gameType: 'ShortFibonacci', name: 'Marvels' }),
    );
  });
  it('should be able to create new session of TShirt & Numbers', async () => {
    render(<CreateGame />);
    const sessionName = screen.getByPlaceholderText('z. B. Sprint 42 — Refinement');
    await userEvent.clear(sessionName);
    await userEvent.type(sessionName, 'Marvels');

    const userName = screen.getByPlaceholderText('Wie sollen dich die anderen sehen?');
    await userEvent.clear(userName);
    await userEvent.type(userName, 'Rock');

    const tShirt = screen.getByTestId('deck-option-TShirtAndNumber');
    await userEvent.click(tShirt);

    const createButton = screen.getByText('Session starten');
    await userEvent.click(createButton);

    expect(gamesService.addNewGame).toHaveBeenCalled();

    expect(gamesService.addNewGame).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: 'Rock', gameType: 'TShirtAndNumber', name: 'Marvels' }),
    );
  });
  it('should be able to create new session of Custom option', async () => {
    render(<CreateGame />);
    const sessionName = screen.getByPlaceholderText('z. B. Sprint 42 — Refinement');
    await userEvent.clear(sessionName);
    await userEvent.type(sessionName, 'Marvels');

    const userName = screen.getByPlaceholderText('Wie sollen dich die anderen sehen?');
    await userEvent.clear(userName);
    await userEvent.type(userName, 'Rock');

    const custom = screen.getByTestId('deck-option-Custom');
    await userEvent.click(custom);

    // input custom values
    const input1 = screen.getByTestId('custom-option-1');
    await userEvent.type(input1, '1');

    const input2 = screen.getByTestId('custom-option-2');
    await userEvent.type(input2, '2');

    const createButton = screen.getByText('Session starten');
    await userEvent.click(createButton);

    expect(gamesService.addNewGame).toHaveBeenCalled();

    expect(gamesService.addNewGame).toHaveBeenCalledWith(
      expect.objectContaining({
        createdBy: 'Rock',
        gameType: 'Custom',
        name: 'Marvels',
        cards: [
          { color: '#9EC8FE', displayValue: '1', value: 1 },
          { color: '#9EC8FE', displayValue: '2', value: 2 },
        ],
      }),
    );
  });
  it('should display error when no custom options entered', async () => {
    render(<CreateGame />);
    const sessionName = screen.getByPlaceholderText('z. B. Sprint 42 — Refinement');
    await userEvent.clear(sessionName);
    await userEvent.type(sessionName, 'Marvels');

    const userName = screen.getByPlaceholderText('Wie sollen dich die anderen sehen?');
    await userEvent.clear(userName);
    await userEvent.type(userName, 'Rock');

    const custom = screen.getByTestId('deck-option-Custom');
    await userEvent.click(custom);

    const createButton = screen.getByText('Session starten');
    await userEvent.click(createButton);

    await waitFor(() => {
      const errorMsg = screen.queryByText(/mindestens zwei eigene Kartenwerte/i);
      if (!errorMsg) {
        screen.debug();
      }
      expect(errorMsg).toBeInTheDocument();
    });
  });
});
