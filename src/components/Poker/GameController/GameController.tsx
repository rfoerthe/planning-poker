import { Alert, Fade, IconButton, Snackbar } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Autorenew';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ExitToApp from '@mui/icons-material/ExitToApp';
import LinkIcon from '@mui/icons-material/Link';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { AlertDialog } from '../../AlertDialog/AlertDialog';
import { InfoDialog } from '../../InfoDialog/InfoDialog';
import { finishGame, removeGame, resetGame } from '../../../service/games';
import { Game } from '../../../types/game';
import { Status } from '../../../types/status';
import { isModerator } from '../../../utils/isModerator';
import { GameTimer } from '../GameTimer/GameTimer';
import './GameController.css';

interface GameControllerProps {
  game: Game;
  currentPlayerId: string;
  remainingMs?: number;
}

export const GameController: React.FC<GameControllerProps> = ({
  game,
  currentPlayerId,
  remainingMs,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [showGameProtected, setShowGameProtected] = useState(false);

  const copyInviteLink = () => {
    const url = `${window.location.origin}/join/${game.id}`;

    navigator.clipboard
      .writeText(url)
      .then(() => setShowCopiedMessage(true))
      .catch((error) => console.error('Failed to copy: ', error));

    return url;
  };

  const leaveGame = () => {
    navigate(`/`);
  };

  const handleRemoveGame = async (recentGameId: string) => {
    await removeGame(recentGameId);
    window.location.href = '/';
  };

  const canManageSession = isModerator(
    game.createdById,
    currentPlayerId,
    game.isAllowMembersToManageSession,
  );

  return (
    <>
      <header className='SessionBar'>
        <div className='SessionBarHeading'>
          <h1 className='SessionBarTitle' title={game.name}>
            {game.name}
          </h1>
          <span className={`StatusPill ${getStatusPillClass(game.gameStatus)}`}>
            <span className='StatusPillDot' aria-hidden='true' />
            {t(getStatusLabelKey(game.gameStatus))}
          </span>
        </div>

        <div className='SessionBarActions'>
          <GameTimer game={game} remainingMs={remainingMs} canManageTimer={canManageSession} />

          {canManageSession && (
            <>
              <button
                type='button'
                className='SessionAction SessionActionPrimary'
                data-testid='reveal-button'
                title={t('session.actions.revealTitle')}
                onClick={() => finishGame(game.id)}
                disabled={
                  game.gameStatus === Status.Finished || game.gameStatus === Status.Started
                }
              >
                <VisibilityIcon fontSize='small' />
                <span className='SessionActionLabel'>{t('session.actions.reveal')}</span>
              </button>

              <button
                type='button'
                className='SessionAction'
                data-testid='restart-button'
                title={t('session.actions.restartTitle')}
                onClick={() => resetGame(game.id)}
                disabled={game.gameStatus === Status.Started}
              >
                <RefreshIcon fontSize='small' />
                <span className='SessionActionLabel'>{t('session.actions.restart')}</span>
              </button>
            </>
          )}

          <InfoDialog
            title={t('session.inviteDialogTitle')}
            onOpen={(): React.ReactNode => (
              <span>
                {t('session.inviteDialogBody')}
                <br />
                <b className='SessionInviteLink'>{copyInviteLink()}</b>
                <br />
                <br />
                {t('session.inviteDialogHint')}
              </span>
            )}
            data-testid='invite-button-dialog'
          >
            <button
              type='button'
              className='SessionAction'
              data-testid='invite-button'
              title={t('session.actions.inviteTitle')}
            >
              <LinkIcon fontSize='small' />
              <span className='SessionActionLabel'>{t('session.actions.invite')}</span>
            </button>
          </InfoDialog>

          <button
            type='button'
            className='SessionAction'
            data-testid='exit-button'
            title={t('session.actions.exitTitle')}
            onClick={() => leaveGame()}
          >
            <ExitToApp fontSize='small' />
            <span className='SessionActionLabel'>{t('session.actions.exit')}</span>
          </button>

          {game.isLocked ? (
            <IconButton
              className='SessionDeleteButton'
              size='small'
              title={t('session.deleteLockedTitle')}
              aria-label={t('session.deleteLockedTitle')}
              onClick={() => setShowGameProtected(true)}
            >
              <LockOutlinedIcon fontSize='small' />
            </IconButton>
          ) : (
            <AlertDialog
              title={t('session.deleteTitle')}
              message={t('session.deleteMessage')}
              onConfirm={() => handleRemoveGame(game.id)}
              data-testid='delete-button-dialog'
            >
              <IconButton
                className='SessionDeleteButton'
                size='small'
                title={t('session.deleteTitle')}
                aria-label={t('session.deleteTitle')}
              >
                <DeleteOutlineIcon fontSize='small' />
              </IconButton>
            </AlertDialog>
          )}
        </div>
      </header>

      <Snackbar
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        open={showCopiedMessage}
        autoHideDuration={5000}
        slots={{ transition: Fade }}
        transitionDuration={1000}
        onClose={() => setShowCopiedMessage(false)}
      >
        <Alert severity='success'>{t('session.inviteCopiedSnackbar')}</Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        open={showGameProtected}
        autoHideDuration={5000}
        slots={{ transition: Fade }}
        transitionDuration={1000}
        onClose={() => setShowGameProtected(false)}
      >
        <Alert severity='error'>{t('session.deleteLockedSnackbar')}</Alert>
      </Snackbar>
    </>
  );
};

const getStatusLabelKey = (gameStatus: Status | string): string => {
  switch (gameStatus) {
    case Status.InProgress:
      return 'session.statusLabel.inProgress';
    case Status.Finished:
      return 'session.statusLabel.finished';
    default:
      return 'session.statusLabel.started';
  }
};

const getStatusPillClass = (gameStatus: Status | string): string => {
  switch (gameStatus) {
    case Status.InProgress:
      return 'StatusPillRunning';
    case Status.Finished:
      return 'StatusPillDone';
    default:
      return 'StatusPillNeutral';
  }
};
