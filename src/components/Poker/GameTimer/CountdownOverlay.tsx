import React from 'react';
import './CountdownOverlay.css';

interface CountdownOverlayProps {
  secondsLeft: number;
}

/**
 * The last seconds of a round, large enough to notice from across the room.
 * Purely decorative: it never swallows clicks, so voting stays possible while
 * it counts down, and screen readers keep the accessible timer in the controls.
 */
export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ secondsLeft }) => {
  return (
    <div className='CountdownOverlay' aria-hidden='true' data-testid='countdown-overlay'>
      {/* The key restarts the pulse animation on every new second. */}
      <span className='CountdownOverlayValue' key={secondsLeft}>
        {secondsLeft}
      </span>
    </div>
  );
};
