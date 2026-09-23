import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';

vi.mock('./service/players');
vi.mock('./service/games');

describe('App', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('Should display toolbar with header', async () => {
    render(<App />);
    const toolBarHeader = screen.getByText('Planning Poker');
    expect(toolBarHeader).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Session starten' })).toBeInTheDocument();
  });

  it('should render the home page for the retired cleanup URL', async () => {
    window.history.replaceState({}, '', '/delete-old-games');

    render(<App />);

    expect(await screen.findByRole('button', { name: 'Session starten' })).toBeInTheDocument();
  });
});
