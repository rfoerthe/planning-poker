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
import './JoinGame.css';

export const JoinGame = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  let { id } = useParams<{ id: string }>();

  const [joinGameId, setJoinGameId] = useState(id);
  const [playerName, setPlayerName] = useState('');
  const [gameFound, setIsGameFound] = useState(true);
  const [showNotExistMessage, setShowNotExistMessage] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (joinGameId) {
        if (await getGame(joinGameId)) {
          setIsGameFound(true);
          if (await isCurrentPlayerInGame(joinGameId)) {
            navigate(`/game/${joinGameId}`);
          }
        } else {
          removeGameFromCache(joinGameId);
          setShowNotExistMessage(true);
          setTimeout(() => {
            navigate('/');
          }, 5000);
        }
      }
    }
    fetchData();
  }, [joinGameId, history]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    if (joinGameId) {
      const res = await addPlayerToGame(joinGameId, playerName);

      setIsGameFound(res);
      setLoading(false);
      if (res) {
        navigate(`/game/${joinGameId}`);
      }
    }
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
