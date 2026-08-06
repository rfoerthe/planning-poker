import { ListItemText, Menu, MenuItem } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import TimerIcon from '@mui/icons-material/Timer';
import TimerOffIcon from '@mui/icons-material/TimerOff';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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

  const label = isRunning ? formatClock(remainingSeconds) : t('timer.label');
  const className = isRunning ? 'SessionAction GameTimerRunning' : 'SessionAction';

  return (
    <>
      {canManageTimer ? (
        <button
          type='button'
          className={className}
          data-testid='timer-button'
          onClick={handleClick}
          disabled={isRevealed}
          title={isRunning ? t('timer.stop') : t('timer.start')}
          aria-haspopup='menu'
          aria-expanded={isMenuOpen ? 'true' : undefined}
        >
          {isRunning ? <TimerOffIcon fontSize='small' /> : <TimerIcon fontSize='small' />}
          <span
            className='SessionActionLabel GameTimerValue TabularNumbers'
            role={isRunning ? 'timer' : undefined}
            data-testid='timer-value'
          >
            {label}
          </span>
        </button>
      ) : (
        <div className={`${className} GameTimerIndicator`}>
          <TimerIcon fontSize='small' />
          <span
            className='SessionActionLabel GameTimerValue TabularNumbers'
            role='timer'
            data-testid='timer-value'
          >
            {label}
          </span>
        </div>
      )}

      <Menu
        anchorEl={menuAnchorEl}
        open={isMenuOpen}
        onClose={closeMenu}
        id='timer-menu'
        slotProps={{ list: { 'aria-label': t('timer.menuLabel') } }}
      >
        {timerDurationsInSeconds.map((durationSeconds) => (
          <MenuItem
            key={durationSeconds}
            selected={game.timerDurationSeconds === durationSeconds}
            onClick={() => handleDurationSelected(durationSeconds)}
            data-testid={`timer-duration-${durationSeconds}`}
          >
            <ListItemText className='GameTimerMenuLabel TabularNumbers'>
              {formatClock(durationSeconds)}
            </ListItemText>
            {game.timerDurationSeconds === durationSeconds ? <CheckIcon fontSize='small' /> : null}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
