import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { vi } from 'vitest';
import * as playersService from '../../../service/players';
import { JoinGame } from './JoinGame';

const mockNavigate = vi.fn();
vi.mock('../../../service/players');
vi.mock('../../../service/games');
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '' }),
  };
});

describe('JoinGame component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('should display correct text fields', () => {
    vi.spyOn(playersService, 'isCurrentPlayerInGame').mockResolvedValue(false);

    render(<JoinGame />);

    expect(screen.getByPlaceholderText('z. B. 01hq…')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Wie sollen dich die anderen sehen?')).toBeInTheDocument();
  });

  it('should display join button', () => {
    vi.spyOn(playersService, 'isCurrentPlayerInGame').mockResolvedValue(false);
    render(<JoinGame />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Beitreten');
  });
  it('should be able to join a session', async () => {
    vi.spyOn(playersService, 'addPlayerToGame').mockResolvedValue(true);
    vi.spyOn(playersService, 'isCurrentPlayerInGame').mockResolvedValue(false);
    render(<JoinGame />);
    const sessionID = screen.getByPlaceholderText('z. B. 01hq…');
    await userEvent.clear(sessionID);
    await userEvent.type(sessionID, 'gameId');

    const userName = screen.getByPlaceholderText('Wie sollen dich die anderen sehen?');
    await userEvent.type(userName, 'Rock');

    const joinButton = screen.getByText('Beitreten');

    await userEvent.click(joinButton);

    expect(playersService.addPlayerToGame).toHaveBeenCalled();

    expect(playersService.addPlayerToGame).toHaveBeenCalledWith('gameId', 'Rock');
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/game/gameId'));
  });
});
