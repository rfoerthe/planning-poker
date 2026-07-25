import { IconButton, ListItemText, Menu, MenuItem, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import TimerIcon from '@mui/icons-material/Timer';
import TimerOffIcon from '@mui/icons-material/TimerOff';
import { deepPurple } from '@mui/material/colors';
import React, { useState } from 'react';
import { startTimer, stopTimer } from '../../../service/games';
import { formatClock, getRemainingSeconds, timerDurationsInSeconds } from '../../../service/timer';
import { Game } from '../../../types/game';
import { Status } from '../../../types/status';
import './GameTimer.css';

interface GameTimerProps {
  game: Game;
  remainingMs?: number;
  canManageTimer: boolean;
}

export const GameTimer: React.FC<GameTimerProps> = ({ game, remainingMs, canManageTimer }) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(menuAnchorEl);
  const remainingSeconds = getRemainingSeconds(remainingMs);
  const isRunning = remainingSeconds !== undefined;
  const isRevealed = game.gameStatus === Status.Finished;

  // Participants only see the timer while it runs; starting it stays with moderators.
  if (!canManageTimer && !isRunning) {
    return null;
  }

  const closeMenu = () => setMenuAnchorEl(null);

  const handleDurationSelected = (durationSeconds: number) => {
    closeMenu();
    void startTimer(game.id, durationSeconds);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isRunning) {
      void stopTimer(game.id);
      return;
    }
    setMenuAnchorEl(event.currentTarget);
  };

  const label = isRunning ? formatClock(remainingSeconds) : 'Timer';

  return (
    <div className='GameControllerButtonContainer'>
      <div className='GameControllerButton'>
        {canManageTimer ? (
          <IconButton
            data-testid='timer-button'
            onClick={handleClick}
            disabled={isRevealed}
            title={isRunning ? 'Stop the round timer' : 'Start a round timer'}
            aria-haspopup='menu'
            aria-expanded={isMenuOpen ? 'true' : undefined}
          >
            {isRunning ? (
              <TimerOffIcon fontSize='large' style={{ color: deepPurple[300] }} />
            ) : (
              <TimerIcon fontSize='large' style={{ color: deepPurple[300] }} />
            )}
          </IconButton>
        ) : (
          <div className='GameTimerIndicator'>
            <TimerIcon fontSize='large' style={{ color: deepPurple[300] }} />
          </div>
        )}
      </div>
      <Typography
        variant='caption'
        className={isRunning ? 'GameTimerValue GameTimerValueRunning' : 'GameTimerValue'}
        role={isRunning ? 'timer' : undefined}
        data-testid='timer-value'
      >
        {label}
      </Typography>
      <Menu anchorEl={menuAnchorEl} open={isMenuOpen} onClose={closeMenu} id='timer-menu'>
        {timerDurationsInSeconds.map((durationSeconds) => (
          <MenuItem
            key={durationSeconds}
            selected={game.timerDurationSeconds === durationSeconds}
            onClick={() => handleDurationSelected(durationSeconds)}
            data-testid={`timer-duration-${durationSeconds}`}
          >
            <ListItemText className='GameTimerMenuLabel'>
              {formatClock(durationSeconds)}
            </ListItemText>
            {game.timerDurationSeconds === durationSeconds ? <CheckIcon fontSize='small' /> : null}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};
