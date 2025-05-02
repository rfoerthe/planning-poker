import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { CreateGame } from './CreateGame';
import * as gamesService from '../../../service/games';

jest.mock('../../../service/games');
jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    push: jest.fn(),
  }),
}));
jest.mock('unique-names-generator', () => ({
  starWars: ['Jabba'],
  colors: ['red'],
  animals: ['kangaroo'],
  uniqueNamesGenerator: jest.fn(),
  Config: jest.fn(),
}));
describe('CreateGame component', () => {
  it('should display correct text fields', () => {
    render(<CreateGame />);

    expect(screen.getByPlaceholderText('Enter a session name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
  });

  it('should display create button', () => {
    render(<CreateGame />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Create');
  });

  it('should empty inputs when clicked', () => {
    render(<CreateGame />);
    const sessionName = screen.getByPlaceholderText('Enter a session name');
    const userName = screen.getByPlaceholderText('Enter your name');
    userEvent.click(sessionName);
    userEvent.click(userName);

    expect(sessionName).toHaveValue('');
    expect(userName).toHaveValue('');
  });

  it('should be able to create new session', async () => {
    render(<CreateGame />);
    const sessionName = screen.getByPlaceholderText('Enter a session name');
    userEvent.clear(sessionName);
    userEvent.type(sessionName, 'Marvels');

    const userName = screen.getByPlaceholderText('Enter your name');
    userEvent.clear(userName);
    userEvent.type(userName, 'Rock');

    const createButton = screen.getByText('Create');
    userEvent.click(createButton);

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
    const sessionName = screen.getByPlaceholderText('Enter a session name');
    userEvent.clear(sessionName);
    userEvent.type(sessionName, 'Marvels');

    const userName = screen.getByPlaceholderText('Enter your name');
    userEvent.clear(userName);
    userEvent.type(userName, 'Rock');

    const allowMembersToManageSession = screen.getByText('Allow members to manage session');
    userEvent.click(allowMembersToManageSession);

    const createButton = screen.getByText('Create');
    userEvent.click(createButton);

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
    const sessionName = screen.getByPlaceholderText('Enter a session name');
    userEvent.clear(sessionName);
    userEvent.type(sessionName, 'Marvels');

    const userName = screen.getByPlaceholderText('Enter your name');
    userEvent.clear(userName);
    userEvent.type(userName, 'Rock');

    const tShirt = screen.getByText('T-Shirt (XXS, XS, S, M, L, XL, XXL)', { exact: false });
    userEvent.click(tShirt);

    const createButton = screen.getByText('Create');
    userEvent.click(createButton);

    expect(gamesService.addNewGame).toHaveBeenCalled();

    expect(gamesService.addNewGame).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: 'Rock', gameType: 'TShirt', name: 'Marvels' }),
    );
  });
  it('should be able to create new session of Short Fibonacci Sizing', async () => {
    render(<CreateGame />);
    const sessionName = screen.getByPlaceholderText('Enter a session name');
    userEvent.clear(sessionName);
    userEvent.type(sessionName, 'Marvels');

    const userName = screen.getByPlaceholderText('Enter your name');
    userEvent.clear(userName);
    userEvent.type(userName, 'Rock');

    const gameType = screen.getByText('Short Fibonacci', { exact: false });
    userEvent.click(gameType);

    const createButton = screen.getByText('Create');
    userEvent.click(createButton);

    expect(gamesService.addNewGame).toHaveBeenCalled();

    expect(gamesService.addNewGame).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: 'Rock', gameType: 'ShortFibonacci', name: 'Marvels' }),
    );
  });
  it('should be able to create new session of TShirt & Numbers', async () => {
    render(<CreateGame />);
    const sessionName = screen.getByPlaceholderText('Enter a session name');
    userEvent.clear(sessionName);
    userEvent.type(sessionName, 'Marvels');

    const userName = screen.getByPlaceholderText('Enter your name');
    userEvent.clear(userName);
    userEvent.type(userName, 'Rock');

    const tShirt = screen.getByText('T-Shirt & Numbers (S, M, L, XL, 1, 2, 3, 4, 5)', {
      exact: false,
    });
    userEvent.click(tShirt);

    const createButton = screen.getByText('Create');
    userEvent.click(createButton);

    expect(gamesService.addNewGame).toHaveBeenCalled();

    expect(gamesService.addNewGame).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: 'Rock', gameType: 'TShirtAndNumber', name: 'Marvels' }),
    );
  });
  it('should be able to create new session of Custom option', async () => {
    render(<CreateGame />);
    const sessionName = screen.getByPlaceholderText('Enter a session name');
    userEvent.clear(sessionName);
    userEvent.type(sessionName, 'Marvels');

    const userName = screen.getByPlaceholderText('Enter your name');
    userEvent.clear(userName);
    userEvent.type(userName, 'Rock');

    const custom = screen.getByText('Custom', { exact: false });
    userEvent.click(custom);

    // input custom values
    const input1 = within(screen.getByTestId('custom-option-1')).getByRole('textbox');
    userEvent.type(input1, '1');

    const input2 = within(screen.getByTestId('custom-option-2')).getByRole('textbox');
    userEvent.type(input2, '2');

    const createButton = screen.getByText('Create');
    userEvent.click(createButton);

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
    const sessionName = screen.getByPlaceholderText('Enter a session name');
    userEvent.clear(sessionName);
    userEvent.type(sessionName, 'Marvels');

    const userName = screen.getByPlaceholderText('Enter your name');
    userEvent.clear(userName);
    userEvent.type(userName, 'Rock');

    const custom = screen.getByText('Custom', { exact: false });
    userEvent.click(custom);

    const createButton = screen.getByText('Create');
    userEvent.click(createButton);
    // eslint-disable-next-line testing-library/await-async-utils
    waitFor(() =>
      expect(
        screen.getByText('Please enter values for at least two custom option'),
      ).toBeInTheDocument(),
    );
  });
});
