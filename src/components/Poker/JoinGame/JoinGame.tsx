import { Alert, Fade, Snackbar } from '@mui/material';
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { getGame } from '../../../service/games';
import {
  addPlayerToGame,
  isCurrentPlayerInGame,
  removeGameFromCache,
} from '../../../service/players';
import { Game } from '../../../types/game';
import './JoinGame.css';

/*
 * Threshold after which the session check is called out as unusually slow.
 * On corporate networks the first Firestore contact can take this long even
 * though nothing is broken — the hint keeps users from giving up or reloading.
 */
const SLOW_CONNECTION_HINT_MS = 8000;

export const JoinGame = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  let { id } = useParams<{ id: string }>();

  const [joinGameId, setJoinGameId] = useState(id);
  const [playerName, setPlayerName] = useState('');
  const [gameFound, setIsGameFound] = useState(true);
  const [showNotExistMessage, setShowNotExistMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadedGame, setLoadedGame] = useState<Game | undefined>(undefined);
  const [checking, setChecking] = useState(false);
  const [showSlowHint, setShowSlowHint] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      if (!joinGameId) {
        return;
      }
      setChecking(true);
      setShowSlowHint(false);
      const slowHintTimer = setTimeout(() => setShowSlowHint(true), SLOW_CONNECTION_HINT_MS);

      // Both reads only share the session id, so they run in parallel — on a
      // slow connection two sequential round trips would double the wait.
      const [game, alreadyInGame] = await Promise.all([
        getGame(joinGameId),
        isCurrentPlayerInGame(joinGameId),
      ]);

      clearTimeout(slowHintTimer);
      if (!active) {
        return;
      }
      setChecking(false);
      setShowSlowHint(false);

      if (game) {
        setLoadedGame(game);
        setIsGameFound(true);
        if (alreadyInGame) {
          navigate(`/game/${joinGameId}`);
        }
      } else {
        setLoadedGame(undefined);
        removeGameFromCache(joinGameId);
        setShowNotExistMessage(true);
        setTimeout(() => {
          navigate('/');
        }, 5000);
      }
    }
    fetchData();

    return () => {
      active = false;
    };
  }, [joinGameId, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!joinGameId) {
      return;
    }
    setLoading(true);

    // The effect usually has the game already; fetching here only covers the
    // case where the user submits before the check for a re-typed id finished.
    const game = loadedGame?.id === joinGameId ? loadedGame : await getGame(joinGameId);

    if (!game) {
      setIsGameFound(false);
      setLoading(false);
      return;
    }

    // Not awaited inside: navigate immediately, the write syncs in the
    // background and latency compensation shows the player on the board.
    addPlayerToGame(game, playerName);
    navigate(`/game/${joinGameId}`);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className='Panel FormPanel'>
        <div className='FormPanelHead'>
          <h2 className='FormPanelTitle'>{t('joinGame.title')}</h2>
          <p className='FormPanelSubtitle'>{t('joinGame.subtitle')}</p>
        </div>

        <div className='FormPanelBody'>
          <div className='FormField'>
            <label className='FormLabel' htmlFor='sessionIdRequired'>
              {t('joinGame.sessionId')}
            </label>
            <input
              className='FormInput JoinGameIdInput'
              id='sessionIdRequired'
              required
              aria-invalid={!gameFound}
              aria-describedby={!gameFound ? 'sessionIdError' : undefined}
              placeholder={t('joinGame.sessionIdPlaceholder')}
              defaultValue={joinGameId}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setJoinGameId(event.target.value)}
            />
            {!gameFound && (
              <p className='FormError' id='sessionIdError'>
                {t('joinGame.sessionNotFound')}
              </p>
            )}
            {checking && (
              <p className='FormHint' role='status'>
                {showSlowHint ? t('joinGame.slowConnectionHint') : t('joinGame.checkingSession')}
              </p>
            )}
          </div>

          <div className='FormField'>
            <label className='FormLabel' htmlFor='playerNameRequired'>
              {t('joinGame.yourName')}
            </label>
            <input
              className='FormInput'
              id='playerNameRequired'
              required
              maxLength={30}
              placeholder={t('joinGame.yourNamePlaceholder')}
              defaultValue={playerName}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setPlayerName(event.target.value)}
            />
          </div>

          <button
            type='submit'
            className='AuroraButton AuroraButtonPrimary AuroraButtonBlock'
            disabled={loading}
          >
            {loading ? t('joinGame.submitting') : t('joinGame.submit')}
          </button>
        </div>
      </form>

      <Snackbar
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        open={showNotExistMessage}
        autoHideDuration={5000}
        slots={{ transition: Fade }}
        transitionDuration={1000}
        onClose={() => setShowNotExistMessage(false)}
      >
        <Alert severity='error'>{t('joinGame.deletedSnackbar')}</Alert>
      </Snackbar>
    </>
  );
};
