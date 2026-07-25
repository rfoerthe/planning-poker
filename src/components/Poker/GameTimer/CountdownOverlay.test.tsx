import { render, screen } from '@testing-library/react';
import { CountdownOverlay } from './CountdownOverlay';

describe('CountdownOverlay component', () => {
  it('should display the remaining seconds', () => {
    render(<CountdownOverlay secondsLeft={7} />);

    expect(screen.getByTestId('countdown-overlay')).toHaveTextContent('7');
  });

  it('should not swallow clicks so that voting stays possible', () => {
    render(<CountdownOverlay secondsLeft={3} />);

    const overlay = screen.getByTestId('countdown-overlay');

    expect(overlay).toHaveClass('CountdownOverlay');
    expect(overlay).toHaveAttribute('aria-hidden', 'true');
  });
});
