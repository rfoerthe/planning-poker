import { Alert, Fade, IconButton, Snackbar } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForeverTwoTone';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { getPlayerRecentGames } from '../../../service/players';
import { removeGame } from '../../../service/games';
import { AlertDialog } from '../../AlertDialog/AlertDialog';
import { PlayerGame } from '../../../types/player';
import './RecentGames.css';

interface RecentGamesProps {
  /**
   * Drop the whole block instead of showing the empty state. Used where the
   * list sits next to other content and would only be noise for a first visit.
   */
  hideWhenEmpty?: boolean;
}

export const RecentGames: React.FC<RecentGamesProps> = ({ hideWhenEmpty = false }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [recentGames, setRecentGames] = useState<PlayerGame[] | undefined>(undefined);
  const [reloadRecent, setReloadRecent] = useState<boolean>(false);
  const [showGameProtected, setShowGameProtected] = useState(false);

  useEffect(() => {
    let fetchCleanup = true;

    async function fetchRecent() {
      const games = await getPlayerRecentGames();
      if (games && fetchCleanup) {
        setRecentGames(games);
      }
    }

    fetchRecent();

    return () => {
      fetchCleanup = false;
    };
  }, [reloadRecent]);

  const handleRemoveGame = async (recentGameId: string) => {
    await removeGame(recentGameId);
    setReloadRecent(!reloadRecent);
  };

  const namedGames = (recentGames ?? []).filter((recentGame) => recentGame.name);

  if (hideWhenEmpty && namedGames.length === 0) {
    return null;
  }

  return (
    <>
      <section className='ResumeBar' aria-label={t('recentGames.title')}>
        <h2 className='SectionLabel ResumeBarLead'>{t('recentGames.title')}</h2>

        {namedGames.length === 0 ? (
          <p className='ResumeBarEmpty'>{t('recentGames.empty')}</p>
        ) : (
          <ul className='ResumeBarList'>
            {namedGames.map((recentGame) => (
              <li className='ResumeChip' key={recentGame.id}>
                <button
                  type='button'
                  className='ResumeChipOpen'
                  aria-label={t('recentGames.open')}
                  onClick={() => navigate(`/game/${recentGame.id}`)}
                >
                  <span className='ResumeChipIcon' aria-hidden='true'>
                    ♠
                  </span>
                  <span className='ResumeChipName'>{recentGame.name}</span>
                  <span className='ResumeChipMeta'>
                    <span>{t('recentGames.createdByLabel')}</span>
                    <span>{recentGame.createdBy}</span>
                  </span>
                </button>

                {recentGame.isModerator &&
                  (recentGame.isLocked ? (
                    <IconButton
                      className='ResumeChipAction'
                      size='small'
                      title={t('recentGames.lockedTitle')}
                      aria-label={t('recentGames.lockedTitle')}
                      onClick={() => setShowGameProtected(true)}
                    >
                      <LockOutlinedIcon fontSize='small' className='ResumeChipLockIcon' />
                    </IconButton>
                  ) : (
                    <AlertDialog
                      title={t('recentGames.removeTitle')}
                      message={t('recentGames.removeMessage', { name: recentGame.name })}
                      onConfirm={() => handleRemoveGame(recentGame.id)}
                    >
                      <IconButton
                        className='ResumeChipAction'
                        size='small'
                        title={t('recentGames.removeAction')}
                        aria-label={t('recentGames.removeAction')}
                      >
                        <DeleteForeverIcon fontSize='small' className='ResumeChipDeleteIcon' />
                      </IconButton>
                    </AlertDialog>
                  ))}
              </li>
            ))}
          </ul>
        )}
      </section>

      <Snackbar
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        open={showGameProtected}
        autoHideDuration={5000}
        slots={{ transition: Fade }}
        transitionDuration={1000}
        onClose={() => setShowGameProtected(false)}
      >
        <Alert severity='error'>{t('recentGames.lockedSnackbar')}</Alert>
      </Snackbar>
    </>
  );
};
